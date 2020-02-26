
//  CONSTANTS
const DIRECTIONS = {"UP":1 ,
                    "DOWN":-1, 
                    "LEFT":2, 
                    "RIGHT":-2
    };

const DATATYPES = { "NOTYPE":-1 ,
                    "TEXT":0 , 
                    "NUMBER":1 , 
                    "DATE":2, 
                    "PEOPLE":3, 
                    "PRIORITY":4, 
                    "STATUS":5,
                    "NAME":6 
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

// VARIABLE DECLERATIONS
let selectedTasks = [];
let selectedColumns = [];
let selectedCell = {};

// CONSTRUCTORS
class Header {
    constructor(name, datatype = DATATYPES.TEXT) {
        this.name = name;
        this.dataType = datatype;
    }
}

class TableStorage {
    constructor(name,initialHeaders,innerStorage=[]) {
        this.tableName = name;
        this.headers = initialHeaders;
        this.cols = initialHeaders.length;
        this.rows = innerStorage.length;
        this.innerStorage = innerStorage;
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
            // console.log(index)
            this.innerStorage.splice(index,1);
            this.rows -= 1;
        }
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
        return this;
    }


    addColumn (newHeader) {
        this.headers = [...this.headers, newHeader];
        for (let i=0; i<(this.rows); i++) {
            this.innerStorage[i].push(null);
        }
        this.cols += 1;
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
        return this;
    }

    moveColumn (index, moveDirection) {
        if ((moveDirection === DIRECTIONS.LEFT && index===1) || (moveDirection === DIRECTIONS.RIGHT && index===this.cols)) {
            return;
        }

        if (moveDirection === DIRECTIONS.RIGHT) {
            if (index<this.cols){
                for (let i=0; i<this.rows; i++) {
                    let selectedRow = this.innerStorage[i];
                    let selectedCol = selectedRow.splice(index,1)[0];
                    selectedRow.splice(index+1,0,selectedCol);
                }
            }
        }else {
            if (index>0){
                for (let i=0; i<this.rows; i++) {
                    let selectedRow = this.innerStorage[i];
                    let selectedCol = selectedRow.splice(index,1)[0];
                    selectedRow.splice(index-1,0,selectedCol);
                }
            }    
        }
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

    __processCellValue (dataType,value) {
        switch (dataType){
            case DATATYPES.DATE:
                return `<input type='text' class='datepicker' value='${value}'`;
                break;                 
            case DATATYPES.PRIORITY:
            return "";
                break;
            case DATATYPES.STATUS:
            return "";
                break;  
            default:
                return value;
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
                return CLS. TSK_STS;
                break; 
            case DATATYPES.NAME:
                return CLS.TSK_NM;
                break;  
            default:

        }
    }

    generateHTMLTable() {
        
        // TABLE
        $(`.${CLS.TBL_CNTR}`).append(`<table class='table ${CLS.TBL_MN}' > </table>`);
        let mainTable = $(`.${CLS.TBL_CNTR} .${CLS.TBL_MN}`)
        // HEADERS
        $(mainTable).append(`<tr class=${CLS.HDR_RW} ></tr>`);
        let headerRow = $(mainTable).find(`.${CLS.HDR_RW}`);
        headerRow.append(`<th class=${CLS.TBL_HDR}><input type="checkbox" id=${IDS.TSK_CHK} /></th>`);
        for (let header of this.headers) {
            headerRow.append(`<th class=${CLS.TBL_HDR}><input type="checkbox" id='${IDS.CLM_CHK}' />${header.name}</th>`)
        }
        $(`#${IDS.CLM_CHK}`).eq(0).css("display","none");
        
        //  TABLE ROW
        for (let task of this.innerStorage) {
            $(mainTable).append(`<tr class=${CLS.TBL_RW} ></tr>`);
            let newRow = $(mainTable).find(`.${CLS.TBL_RW}`).eq(-1);
            newRow.append(`<td class='table-cell ${CLS.TSK_SLR}'> <input type="checkbox" id='${IDS.TSK_CHK}'/>
        </td>`)
            for (let [i,value] of task.entries()){
                let className = this._returnClassName(this.headers[i].dataType);
                let processedValue = this.__processCellValue(this.headers[i].dataType,value)
                let contentEditable
                (className === CLS.TSK_NM || className === CLS.TSK_TXT) ? contentEditable = "contenteditable='true'" : contentEditable="";
                newRow.append(`<td class="table-cell ${className}" ${contentEditable}> ${processedValue} </td>`)
            }
        }

    }

}

// MAIN PROCEDURE

$(document).ready(mainProcedure())

function mainProcedure() {

    initialHeaders = createInitialHeaders();
    mainTableStorage = new TableStorage("Table1",initialHeaders);
    mainTableStorage.addRow().setCellValue(0,0,"Task1").setCellValue(0,3,"High");
    mainTableStorage.addRow().setCellValue(1,0,"Task2").setCellValue(1,3,"Low");
    mainTableStorage.addRow().setCellValue(2,0,"Task3").setCellValue(2,3,"Intermediate");

    mainTableStorage.generateHTMLTable()

    decideAccess();

    // ADD TASK BUTTON EVENT
    $("#add_button").on('click',function(){
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

    $(".table-main").on('click',".table-cell",function(){   
        let tableRow = $(this).parents(".table-row");
        let rowIndex = $(".table-row").index(tableRow);
        let colIndex = $(tableRow).children(".table-cell").index($(this))-1
        selectedCell = {row:rowIndex, col:colIndex}
    })

    $('.datepicker').datepicker(
        {
            onSelect: function(dateText, inst){
                mainTableStorage.setCellValue(selectedCell.row,selectedCell.col,dateText)
            }
    }
    );
    // $(".table-main").on('click','.task-date',function(){
    //     console.log($(this))
    //     $(this).datepicker();
    // })
}



// FUNCTIONS

function createInitialHeaders() {
    taskNameHeader = new Header("Task Name", DATATYPES.TEXT);
    statusHeader = new Header("Status", DATATYPES.STATUS);
    dueDateHeader = new Header("Due Date", DATATYPES.DATE);
    priorityHeader = new Header("Priority", DATATYPES.PRIORITY);
    return [taskNameHeader,statusHeader,dueDateHeader,priorityHeader]
}

function addNewTask (taskName) {
    let lastRow = $(".table-main .table-row").eq(-1);
    $(".table-main").append($(lastRow).clone())
    lastRow = $(".table-main .table-row").eq(-1);
    $(lastRow).find(".table-cell").each(function(index){
        switch(index) {
            case 0:
                $(this).find("#task_checkbox").prop('checked',false);
                break;
            case 1:
                $(this).html(taskName)
              break;
            default:
                $(this).html("")
          }
    })
    mainTableStorage.addRow().setCellValue(-1,0,taskName)
}

function removeTasks() {
    selectedTasks.sort()
    selectedTasks.reverse()
    selectedTasks.forEach(index => {
        $(".table-main .table-row").eq(index).remove()
    });
    mainTableStorage.removeRows(selectedTasks)
}

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
    
}

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



function updateSelected(arr,index) {
    arr[0] = index
}

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

function toggleEnabled(divClass,value) {
    $(`.${divClass} *`).prop('disabled',!value);
}


