/* 
------------------------------------------------------------------------------------------
This is the main javascript code for the "To Do List Task" project 
The following can divided into four main parts:
    I)      Constant declarations
    II)     Varaiable declarations
    III)    Classes
    IV)     Main Procedure
    V)      Helper Functions 
------------------------------------------------------------------------------------------
*/
//  CONSTANT DECLARATIONS

const DIRECTIONS = {"UP":1 ,
                    "DOWN":-1, 
                    "LEFT":2, 
                    "RIGHT":-2
    };

const DATATYPES = { "NOTYPE":-1,
                    "TEXT":0,
                    "DATE":1,  
                    "PRIORITY":2, 
                    "STATUS":3,
                    "NAME":4 
                };

const CLS = {   "TBL_CNTR":"table-container", 
                "TBL_MN":"table-main", 
                "TBL_HDR":"table-header", 
                "TBL_RW":"table-row", 
                "TBL_CL":"table-cell", 
                "TSK_NM":"task-name", 
                "TSK_STS":"task-status", 
                "TSK_DT":"task-date", 
                "TSK_PRT":"task-priority",
                "TSK_PPL":"task-people",
                "TSK_TXT":"task-text", 
                "HDR_RW":"header-row", 
                "TSK_SLR":"task-selector" 
            }

const IDS = {   "TSK_CHK":"task_checkbox", 
                "CLM_CHK":"column_checkbox" 
            }

const STSCLS = {"Just Started":"style-just-started",
                "In Progress":"style-in-progress",
                "Stuck":"style-stuck",
                "Waiting for Review":"style-waiting-for-review",
                "Done":"style-done",
                "":"style-none",
}

const PRTCLS = {"Urgent":"style-urgent",
                "High":"style-high",
                "Medium":"style-medium",
                "Low":"style-low",
                "":"style-none",
}

const CLTYPCLS = {  "Text":"task-text",
                    "Due Date":"task-date",
                    "Priority":"task-priority",
                    "Status":"task-status"
}

// ------------------------------------------------------------------------------
// VARIABLE DECLERATIONS
let selectedTasks = [];
let selectedColumns = [];
let selectedCell = {};
let selectedHeader = {};

// ------------------------------------------------------------------------------
// CLASSES
class Header {
    constructor(name, datatype = DATATYPES.TEXT) {
        this.name = name;
        this.dataType = datatype;
    }
}

// Save a copy of the HTML table in memory and saves the changes in the localStorage
class TableStorage {
    constructor(name,initialHeaders,innerStorage=[]) {
        this.tableName = name;
        this.headers = initialHeaders;
        this.cols = initialHeaders.length;
        this.rows = innerStorage.length;
        this.innerStorage = innerStorage;
        this.saveTableStorage()
    }
    addRow () {
        let newRow = [];
        for (let i=0; i<(this.cols); i++) {
            newRow.push("");
        }
        this.innerStorage.push(newRow);
        this.rows += 1
        return this;
    }

    removeRows (indices) {
        for (let index of indices){
            this.innerStorage.splice(index,1);
            this.rows -= 1;
        }
        this.saveTableStorage()
        return this;
    }

    moveRow (index, moveDirection) {
        
        if (moveDirection === DIRECTIONS.UP){       
            if (index > 0) {
                let selectedRow = this.innerStorage.splice(index,1)[0];
                this.innerStorage.splice(index-1,0,selectedRow);
                
            }
        }else {
            if (index<(this.rows-1)) {
                let selectedRow = this.innerStorage.splice(index,1)[0];
                this.innerStorage.splice(index+1,0,selectedRow);
            }
        }    
        this.saveTableStorage()
        return this;
    }


    addColumn (newHeader) {
        this.headers = [...this.headers, newHeader];
        for (let i=0; i<(this.rows); i++) {
            this.innerStorage[i].push("");
        }
        this.cols += 1;
        this.saveTableStorage()
        return this;      
    } 

    removeColumns (indices) {
        for (let index of indices){
            for (let i=0; i<this.rows; i++) {
                this.innerStorage[i].splice(index,1)
            }
            this.headers.splice(index,1)
            this.cols -= 1;
        }
        this.saveTableStorage()
        return this;
    }

    moveColumn (index, moveDirection) {
        if ((moveDirection === DIRECTIONS.LEFT && index===1) || (moveDirection === DIRECTIONS.RIGHT && index===this.cols)) {
            return this;
        }

        if (moveDirection === DIRECTIONS.RIGHT) {
            for (let i=0; i<this.rows; i++) {
                let selectedRow = this.innerStorage[i];
                let selectedCol = selectedRow.splice(index,1)[0];
                selectedRow.splice(index+1,0,selectedCol);
            }
            let selectedHeader = this.headers.splice(index,1)[0];
            this.headers.splice(index+1,0,selectedHeader);
        }else {
            for (let i=0; i<this.rows; i++) {
                let selectedRow = this.innerStorage[i];
                let selectedCol = selectedRow.splice(index,1)[0];
                selectedRow.splice(index-1,0,selectedCol);
            }
            let selectedHeader = this.headers.splice(index,1)[0];
            this.headers.splice(index-1,0,selectedHeader);
  
        }
        this.saveTableStorage()
        return this;
    }


    setCellValue(row,col,value) {
        let rowIndex = row
        let colIndex = col
        if (row<0) {
            rowIndex = this.rows + row;
        }
        if (col<0) {
            colIndex = this.cols + col;
        }

        this.innerStorage[rowIndex][colIndex] = value;
        this.saveTableStorage()
        return this;
    }
    getCellValue(row,col) {
        let rowIndex = row
        let colIndex = col
        if (row<0) {
            rowIndex = this.rows + row;
        }
        if (col<0) {
            colIndex = this.cols + col;
        }   
        return this.innerStorage[rowIndex][colIndex];
    }

    setHeaderName(index,name){
        this.headers[index].name = name;
        this.saveTableStorage()
        return this;
    }

    setTableName(name){
        this.tableName = name;
        this.saveTableStorage()
        return this;
    }

    processCellValue (dataType,value) {
        switch (dataType){
            case DATATYPES.DATE:
                return `<input type='text' class='form-control datepicker' value="${value}"/>`;
                break;
            case DATATYPES.NAME:
                return `<input type='text' class='form-control taskpicker' value="${value}"/>`;
                break;                   
            case DATATYPES.PRIORITY:
                return value;
                break;
            case DATATYPES.STATUS:
                return value;
                break;
            case DATATYPES.TEXT:
                return `<input type='text' class='form-control textpicker' value="${value}"/>`;
                break;                      
            default:
                return value;
        }    
    }

    _returnType(columnType) {
        switch (columnType){
            case "Text":
                return DATATYPES.TEXT;
                break;
            case "Due Date":
                return DATATYPES.DATE;
                break;
            case "Priority":
                return DATATYPES.PRIORITY;
                break;
            case "Status":
                return DATATYPES.STATUS;
                break;    
            default:
                return DATATYPES.NOTYPE;
                break;            
        }
    }

    _returnClassName (dataType) {
        switch (dataType){
            case DATATYPES.TEXT:
                return CLS.TSK_TXT;
                break;    
            case DATATYPES.DATE:
                return CLS.TSK_DT;
                break;                 
            case DATATYPES.PRIORITY:
                return CLS.TSK_PRT;
                break;
            case DATATYPES.STATUS:
                return CLS.TSK_STS;
                break; 
            case DATATYPES.NAME:
                return CLS.TSK_NM;
                break;  
            default:

        }
    }

    _returnColumnWidth(dataType) {
        switch (dataType){
            case DATATYPES.TEXT:
                return 150;
                break;    
            case DATATYPES.DATE:
                return 120;
                break;                 
            case DATATYPES.PRIORITY:
                return 120;
                break;
            case DATATYPES.STATUS:
                return 180;
                break; 
            case DATATYPES.NAME:
                return 250;
                break;  
            default:
                return 0;
        }
    }

    generateHTMLTableTitle(){
        // TABLE TITLE
        $(`.${CLS.TBL_CNTR}`).append(`<input type='text' class='lead tablenamepicker' value="${this.tableName}"/>`)
    } 
    
    generateHTMLTable(){
        // TABLE
        $(`.${CLS.TBL_CNTR}`).append(`<table class='table table-sm ${CLS.TBL_MN}' > </table>`);
    }
    
    generateHTMLTableContents(mainTable) {
        // HEADERS
        $(mainTable).append(`<tr class=${CLS.HDR_RW} ></tr>`);
        let headerRow = $(mainTable).find(`.${CLS.HDR_RW}`);
        headerRow.append(`<th class=${CLS.TBL_HDR}><input type="checkbox"  id=${IDS.TSK_CHK} /></th>`);
        for (let header of this.headers) {
            let content
            if (header.dataType===DATATYPES.NAME) {
                content = header.name 
            }else {
                content = `<input type='text' class='columnpicker' value="${header.name}"/>`
            }
            headerRow.append(`<th class=${CLS.TBL_HDR}><input type="checkbox" id='${IDS.CLM_CHK}' />${content}</th>`)
        }
        $(`#${IDS.CLM_CHK}`).eq(0).css("display","none");
        this.adjustHTMLTableWidth(mainTable);
        //  TABLE ROW
        for (let task of this.innerStorage) {
            this.generateHTMLRow(mainTable,task)
        }

    }

    generateHTMLRow(mainTable,task=[]) {
        $(mainTable).append(`<tr class=${CLS.TBL_RW} ></tr>`);
        let newRow = $(mainTable).find(`.${CLS.TBL_RW}`).eq(-1);
        newRow.append(`<td class='table-cell ${CLS.TSK_SLR}'> <input type="checkbox" id='${IDS.TSK_CHK}'>
    </td>`)
        if (task.length === 0){
            for (let i=0; i<this.headers.length; i++){
                task.push("");
            }
        }
        for (let [i,value] of task.entries()){
            let className = this._returnClassName(this.headers[i].dataType);
            if (this.headers[i].dataType === DATATYPES.STATUS) {
                className += ` ${STSCLS[value]}`; 
            }else if((this.headers[i].dataType === DATATYPES.PRIORITY)){
                className += ` ${PRTCLS[value]}`; 
            }
            let processedValue = this.processCellValue(this.headers[i].dataType,value)
            newRow.append(`<td class="table-cell ${className}"> ${processedValue} </td>`)
        } 
    }

    generateHTMLColumn(mainTable,name,columnType) {
        for (let row of $(mainTable).children(".table-row")) {
            let value = this.processCellValue(this._returnType(columnType),"");
            let newTableCell = `<td class='table-cell ${CLTYPCLS[columnType]}'>${value}</td>`
            $(row).children('.table-cell').eq(-1).after(newTableCell)
        }
        let row = $(mainTable).children(".header-row");
        let newTableCell = `<th class='table-header'><input type='checkbox' id='column_checkbox' ><input type='text' class='columnpicker' value="${name}"/></th>`
        $(row).children(".table-header").eq(-1).after(newTableCell)
       
       
    }

    adjustHTMLTableWidth(mainTable) {
        let tableWidth = 15;

        for (let header of this.headers) {
            tableWidth += this._returnColumnWidth(header.dataType);
        }
        $(mainTable).css('width',`${tableWidth}px`);
    }

    clearHTMLTable(mainTable){
        $(mainTable).find("*").remove()
    }

    saveTableStorage(){
        localStorage.setItem("mainTableStorage",JSON.stringify(this));
    }
    clearTableStorage(){
        localStorage.removeItem("mainTableStorage");
    }
}

// ------------------------------------------------------------------------------
// MAIN PROCEDURE

$(document).ready(mainProcedure())

function mainProcedure() {

    //  GENERATING THE MAIN TABLE
    tableRender()
    // ADD TASK BUTTON EVENT
    $("#add_task_button").on('click',function(){
        // ADDS NEW ITEM TO THE TABLE
        addNewTask($("#new_task_name").val())
        // EMPTIES THE NEW TASK INPUT
        $("#new_task_name").val("")
    })

    // MOVE UP TASK BUTTON EVENT
    $("#moveup_task_button").on('click',function(){
        moveTask(selectedTasks[0],DIRECTIONS.UP);
    })
   
    // MOVE DOWN TASK BUTTON EVENT
    $("#movedown_task_button").on('click',function(){
        moveTask(selectedTasks[0],DIRECTIONS.DOWN);
    })
   

    // REMOVE TASK BUTTON EVENT
    $("#remove_task_button").on('click',function(){
        removeTasks();
    })

    // TASK CHECKBOX CHANGE EVENT
    $(".table-main").on('change','#task_checkbox',function(){
        // GETS THE INDEX AND CHECKED PROP OF THE CLICKED CHECKBOX
        const index = $(".table-main #task_checkbox").index(this) - 1;
        const check_value = $(this).prop('checked');
        toggleTaskSelection(index,check_value);
    })

    // ADD COLUMN BUTTON EVENT
    $("#reset_table_button").on('click',function(){
        mainTableStorage.clearTableStorage();
        mainTableStorage.clearHTMLTable($('.table-main'),)
        tableRender()
    })

    // ADD COLUMN BUTTON EVENT
    $("#add_column_button").on('click',function(){
        addColumn( $("#new_column_name").val(),$("#new_column_type").val())
        $("#new_column_name").val("")
    })

    // MOVE UP COLUMN BUTTON EVENT
    $("#moveleft_column_button").on('click',function(){
        moveColumn(selectedColumns[0],DIRECTIONS.LEFT);
    })
    
    // MOVE DOWN COLUMN BUTTON EVENT
    $("#moveright_column_button").on('click',function(){
        moveColumn(selectedColumns[0],DIRECTIONS.RIGHT);
    })
    

    // REMOVE COLUMN BUTTON EVENT
    $("#remove_column_button").on('click',function(){
        removeColumns();
    })

    // COLUMNS CHECKBOX CHANGE EVENT
    $(".table-main").on('change','#column_checkbox',function(){
        // GETS THE INDEX AND CHECKED PROP OF THE CLICKED CHECKBOX
        const index = $(".table-main #column_checkbox").index(this) ;
        const check_value = $(this).prop('checked');
        toggleColumnSelection(index,check_value);
    })

    // SELECTING A TABLE CELL EVENT
    $(".table-main").on('click',".table-cell",function(){   
        let tableRow = $(this).parents(".table-row");
        let rowIndex = $(".table-row").index(tableRow);
        let colIndex = $(tableRow).children(".table-cell").index($(this))-1
        selectedCell = {row:rowIndex, col:colIndex}
    })

    // SELECTING A TABLE HEADER EVENT
    $(".table-main").on('click',".table-header",function(){   
        let tableRow = $(this).parents(".header-row");
        let colIndex = $(tableRow).children(".table-header").index($(this))-1
        selectedHeader = {col:colIndex}
    })

    // CHANGING TABLE NAME EVENT
    $("body").on('blur',".tablenamepicker",function(){
        let prevValue = mainTableStorage.tableName;
        if ($(this).val() !== ""){
            mainTableStorage.setTableName($(this).val());
        }else {
            $(this).val(prevValue);
        }
    })

    // CHANGING TASK NAME EVENT
    $("body").on('blur',".taskpicker",function(){
        let prevValue = mainTableStorage.getCellValue(selectedCell.row,selectedCell.col);
        if ($(this).val() !== ""){
            mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,$(this).val())
        }else {
            $(this).val(prevValue);
        }
    })

    // CHANGING TASK NAME EVENT
    $("body").on('blur',".textpicker",function(){
        mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,$(this).val())
    })

    // CHANGING COLUMN NAME EVENT
    $("body").on('blur',".columnpicker",function(){
        let prevValue = mainTableStorage.headers[selectedHeader.col].name;
        if ($(this).val() !== ""){
            mainTableStorage.setHeaderName(selectedHeader.col, $(this).val())
        }else {
            $(this).val(prevValue);
        }
    })

    // PICKING A DATE EVENT
    $("body").on('focus','.datepicker',function(){
        $(this).datepicker(
            {
                onSelect: function(dateText, inst){
                    mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,dateText)
                }
        }
        );   
    })

    // TRIGGERRING STATUS DROPDOWN
    $(".table-main").on('click','.task-status',function(e){
        e.stopPropagation();
        let cssStatus = $(this).offset();
        cssStatus['display']='block';
        $(".status").css(cssStatus);
        $(".status").find('[data-toggle=dropdown]').dropdown('toggle');
    })

    // PICKING A STATUS EVENT
    $(".status").on("click",'.dropdown-item',function(){
        selectedStatusIndex = $(".status").find('.dropdown-item').index($(this));
        newValue = $(this).html();
        let rowElement = $(".table-row").eq(selectedCell.row);
        let cellElement = $(rowElement).children(".table-cell").eq(selectedCell.col+1)
        $(cellElement).html(newValue)
        prevValue = mainTableStorage.getCellValue(selectedCell.row,selectedCell.col)
        $(cellElement).removeClass(STSCLS[prevValue]);
        mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,newValue);
        $(cellElement).addClass(STSCLS[newValue]);
    })

    // TRIGGERING PRIORITY SROPDOWN
    $(".table-main").on('click','.task-priority',function(e){
        e.stopPropagation();
        let cssPriority = $(this).offset();
        cssPriority['display']='block';
        $(".priority").css(cssPriority);
        $(".priority").find('[data-toggle=dropdown]').dropdown('toggle');
    })

    // PICKING A PRIORITY EVENT
    $(".priority").on("click",'.dropdown-item',function(){
        selectedPriorityIndex = $(".priority").find('.dropdown-item').index($(this));
        newValue = $(this).html();
        let rowElement = $(".table-row").eq(selectedCell.row);
        let cellElement = $(rowElement).children(".table-cell").eq(selectedCell.col+1)
        $(cellElement).html(newValue)
        prevValue = mainTableStorage.getCellValue(selectedCell.row,selectedCell.col)
        $(cellElement).removeClass(PRTCLS[prevValue]);
        mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,newValue);
        $(cellElement).addClass(PRTCLS[newValue]);
    })

}


// ------------------------------------------------------------------------------
// FUNCTIONS

// Initailizes headers when there are no save tables in the storage
function createInitialHeaders() {
    taskNameHeader = new Header("Task Name", DATATYPES.NAME);
    statusHeader = new Header("Status", DATATYPES.STATUS);
    dueDateHeader = new Header("Due Date", DATATYPES.DATE);
    priorityHeader = new Header("Priority", DATATYPES.PRIORITY);
    return [taskNameHeader,statusHeader,dueDateHeader,priorityHeader]
}

// Renders the table [used at first initializationan and when user resets the table
function tableRender(){
    tempStorage = JSON.parse(localStorage.getItem("mainTableStorage"));
    if (tempStorage===null) {
        initialHeaders = createInitialHeaders();
        mainTableStorage = new TableStorage("To-Do List1",initialHeaders);
        mainTableStorage.addRow().setCellValue(0,0,"Task1");
    } else {
        mainTableStorage = new TableStorage(tempStorage.tableName,tempStorage.headers,tempStorage.innerStorage);
    }
    let mainTable = $(".table-main");
    if (mainTable.length === 0){
        mainTableStorage.generateHTMLTableTitle()
        mainTableStorage.generateHTMLTable();
        mainTable = $(".table-main");
    }
    mainTableStorage.generateHTMLTableContents(mainTable)
    mainTableStorage.adjustHTMLTableWidth()
    decideAccess();
}

// -----------------------------------------------------------------
// HELPER FUNCTIONS OF TASKS 
// -----------------------------------------------------------------
// Adds a new task to the HTML table and the mainTableStorage
function addNewTask (taskName) {
    const task = [];
    for (let i=0; i<mainTableStorage.headers.length; i++){
        task.push("");
    }
    task[0]=taskName;
    mainTableStorage.generateHTMLRow($('.table-main'),task)
    mainTableStorage.addRow().setCellValue(-1,0,taskName)
}

// Removes task(s) from the HTML table and the corresponding row in the mainTableStorage
function removeTasks() {
    selectedTasks.sort()
    selectedTasks.reverse()
    selectedTasks.forEach(index => {
        $(".table-main .table-row").eq(index).remove()
    });
    mainTableStorage.removeRows(selectedTasks)
}

// Moves a task in the HTML table and the corresponding row in the mainTableStorage
function moveTask(index,moveDirection) {
    row = $(".table-main .table-row").eq(index)
    maxIndex = $(".table-main .table-row").length-1;
    if (moveDirection === DIRECTIONS.UP) {
        if (index > 0) {
            row.insertBefore(row.prev());
            updateSelected(selectedTasks,index-1);
        }

    } else {
        if (index < maxIndex) {
            row.insertAfter(row.next());
            updateSelected(selectedTasks,index+1);
        }
    }
    mainTableStorage.moveRow(index,moveDirection)
    
    
}

// Manages the selection of checkbox of each task  
function toggleTaskSelection(index,check_value) {
    if (check_value && (selectedColumns.length>0)) {
        let oldSelectedColumns = [...selectedColumns]
        for (let sc of oldSelectedColumns){
            toggleColumnSelection(sc,false);
        }
    }
    switch(index) {
        // SELECTS (OR DESELECTS) ALL TASKS IN THE TABLE
        case -1:
            selectedTasks = [];
            for (i = 1; i < $(".table-main #task_checkbox").length; i++) {
                if (check_value) {
                    changeSelected(selectedTasks,i-1,check_value);
                }
                $(".table-main #task_checkbox").eq(i).prop('checked',check_value);
            }
            break;
        // SELECTS (OR DESELECTS) A SINGLE TASK
        default:
            if (!check_value) {
                $(".table-main #task_checkbox").eq(0).prop('checked',false);
                $(".table-main #task_checkbox").eq(index+1).prop('checked',false);
            }
            changeSelected(selectedTasks,index,check_value);
      }
      decideAccess()
}

// -----------------------------------------------------------------
// HELPER FUNCTIONS OF COLUMNS 
// -----------------------------------------------------------------

// Adds a new column to the HTML table and the mainTableStorage
function addColumn(name,dataType) {
    if (name==="") {
        name = dataType;
    }
    mainTableStorage.generateHTMLColumn($('.table-main'),name,dataType)
    mainTableStorage.addColumn(new Header(name,mainTableStorage._returnType(dataType)))
    mainTableStorage.adjustHTMLTableWidth($('.table-main'))
}

// Removes column(s) from the HTML table and the mainTableStorage
function removeColumns(){
    selectedColumns.sort()
    selectedColumns.reverse()
    for (let row of $(".table-main .table-row")) {
        selectedColumns.forEach(index => {
            $(row).children(".table-cell").eq(index+1).remove()
        })
    }
    let row = $(".table-main .header-row");
    selectedColumns.forEach(index => {
        $(row).children(".table-header").eq(index+1).remove()
    })

    mainTableStorage.removeColumns(selectedColumns)
    mainTableStorage.adjustHTMLTableWidth($('.table-main'))
    
}

// Moves a column in the HTML table and the corresponding row in the mainTableStorage
function moveColumn(index,moveDirection) {
    maxIndex = $(".table-main .header-row .table-header").length-2;

    if ((moveDirection === DIRECTIONS.LEFT && index===1) || (moveDirection === DIRECTIONS.RIGHT && index===maxIndex)) {
        return;
    }
    
    for (let row of $(".table-main .table-row")) {
        col = $(row).children(".table-cell").eq(index+1);
        if (moveDirection === DIRECTIONS.LEFT) {
            col.insertBefore(col.prev());
        } else {
            col.insertAfter(col.next());  
        }
    }

    let row = $(".table-main .header-row");
    col = row.children(".table-header").eq(index+1);
    if (moveDirection === DIRECTIONS.LEFT) {
        col.insertBefore(col.prev());
        updateSelected(selectedColumns,index-1);
    } else {
        col.insertAfter(col.next());
        updateSelected(selectedColumns,index+1);  
    }

    mainTableStorage.moveColumn(index,moveDirection)
}

// Manages the selection of checkbox of each column  
function toggleColumnSelection(index,check_value) {
    if (check_value && (selectedTasks.length>0)) {
        let oldSelectedTasks = [...selectedTasks]
        for (let st of oldSelectedTasks){
            
            toggleTaskSelection(st,false);
        }
    }
    if (!check_value) {
        $(".table-main #column_checkbox").eq(index).prop('checked',false);
    }
    changeSelected(selectedColumns,index,check_value);
    decideAccess()
}


// -----------------------------------------------------------------
// GENERAL FUNCTIONS 
// -----------------------------------------------------------------

// Add or removes an index to the selectedColumns/Tasks array
function changeSelected(arr,index,check_value) {
    if (check_value) {
        arr.push(index);
    }else {
        const pos = arr.indexOf(index);
        if (pos > -1) {
            arr.splice(pos, 1);
        }
    }
}

// Updates the selectedColumns/Tasks array
function updateSelected(arr,index) {
    arr[0] = index
}

// (Dis)activates move and delete buttons on the panel based on checkboxes
function decideAccess() {
    switch(selectedTasks.length) {
        case 0:
            toggleEnabled("edit-task",false);
            toggleEnabled("remove-task",false);
            break;
        case 1:
            toggleEnabled("edit-task",true);
            toggleEnabled("remove-task",true);
          break;
        default:
            toggleEnabled("edit-task",false);
            toggleEnabled("remove-task",true);
      }


    switch(selectedColumns.length) {
        case 0:
            toggleEnabled("edit-column",false);
            toggleEnabled("remove-column",false);
            break;
        case 1:
            toggleEnabled("edit-column",true);
            toggleEnabled("remove-column",true);
          break;
        default:
            toggleEnabled("edit-column",false);
            toggleEnabled("remove-column",true);
      } 
}

// Changes disable property of each element
function toggleEnabled(className,value) {
    $(`.${className}`).prop('disabled',!value);
}


