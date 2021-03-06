/*
   I decided not to use jQuery
   So I wrote happy little shortcuts
   to some longer "pure js™" functions
*/

/**
   Returns elements matching selector
*/
function QSA(sel){
    return document.querySelectorAll(sel);
}

/**
   Returns elements matching selector withing parent
*/
function SQSA(el, sel){
    if(el == undefined){
        console.log("Selector: " + sel);
    }
    return el.querySelectorAll(sel);
}

/**
   Adds element as the first child of parent
*/
function prepend(parent,el){
    parent.insertBefore(el,parent.firstChild);
}

function has_class(el,classname){
    return el.classList.contains(classname);
}

function remove_class(el,classname){
    return el.classList.remove(classname);
}

function add_class(el,classname){
    return el.classList.add(classname);
}

function deep_copy(obj){
    var new_object = {};
    if(obj instanceof Array){
        new_object = [];
    } else if(obj == null || obj == undefined){
        return null;
    } else if(typeof(obj) !== 'object'){
        /* If it is a variable, just return it */
        return obj;
    }
    for(el in obj){
        if(typeof(obj[el]) == "object"){
            new_object[el] = deep_copy(obj[el]);
        } else {
            new_object[el] = obj[el];
        }
    }
    return new_object;
}

function get_html(name){
    var script = QSA("script[name='"+name+"']")[0];
    if(script == undefined){
        console.log(
            "Error: script '" + name + "' does not exist."
        );
        return "";
    }
    return script.innerHTML;
}

function assert(condition,message){
    if(!condition){
        console.error("assert failed: "+message);
    }
}


/**
    @param tag example div.btn.carrot
    creates a div with classes btn and carrot
    @param content sets innerHTML
 */
function create_dom(tag,content){
    var parent = document.createElement(tag.split(".")[0]);
    var classes = tag.split(".").splice(1);
    for(var i = 0; i < classes.length; i++){
        add_class(parent,classes[i]);
    }
    parent.innerHTML = content || "";
    return parent;
}

function init_panels_ui(container){
    var buttons = SQSA(container,".menubar .button");
    for(var i=0; i < buttons.length; i++){
        buttons[i].onclick = function(){
            var id = this.getAttribute("data-panel-id");
            var panel = get_panel(id);
            var panelOpened = false;
            if(has_class(panel,"menu-panel-displayed")){
                panelOpened = true;
            }

            close_menu_panels(container);

            if(!panelOpened){
                add_class(panel,"menu-panel-displayed")
            }
        }
    }

    function get_panel(id){
        return SQSA(
            container,
            ".menu-panel[data-panel-id='"+id+"']"
        )[0];
    }
}

function close_menu_panels(container){
    var displayed = SQSA(container,".menu-panel-displayed");
    for(var i = 0; i < displayed.length; i++){
        var el = displayed[i];
        remove_class(el,"menu-panel-displayed");
    }
}

function init_keyboard(root){
    root.keyboard = {};
    root.keyboard.keys = {};
    var keyboard = root.keyboard;
    keyboard.callbacks = [];
    keyboard.keycode_callbacks = [];
    
    root.keyboard.listen_key = function(root,key){
        if(!(key in root.keyboard.keys)){
            root.keyboard.keys[key] = false;
        }
    };

    root.keyboard.listen_keycode = function(root,keycode,callback){
        // create shortcut var
        var kcc = root.keyboard.keycode_callbacks;
        // Create array if not exist
        if(kcc[keycode] == undefined){
            kcc[keycode] = [];
        }
        // add event listener
        kcc[keycode].push(callback);
    };

    window.addEventListener("keydown",function(e){
        str = String.fromCharCode(e.keyCode);
        // Sorry for this short var name
        // kc stands for  keyboardcallback
        var kc = root.keyboard.callbacks[str];
        for(var callback in kc){
            kc[callback](e);
        }
        // kcc stands for  keycodecallback
        var kcc = root.keyboard.keycode_callbacks[e.keyCode];
        for(var callback in kcc){
            kcc[callback](e);
        }
        set_current_key(e,true);
    });

    document.onkeyup = function(e){
        set_current_key(e,false);
    };

    function set_current_key(e, value){
        str = String.fromCharCode(e.keyCode);
        for(var key in keyboard.keys){
            if(e.keyCode == key){
                keyboard.keys[key] = value;
            } else if (str == key){
                keyboard.keys[key] = value;
            }
        }
    }

}


function initInputs(parentNode, inputs, callback){
    var callback = callback || function(){};
    for(input in inputs){
        var html_input = SQSA(
            parentNode,
            "input[data-name="+input+"],"+
            "select[data-name="+input+"],"+
            "textarea[data-name="+input+"]"
        )[0];

        enableInput(
            html_input,
            inputs,
            input,
            callback
        );
    }
}

function enableInput(html_input, data_array, index, callback){
    var callback = callback || {};
    var type = html_input.type;

    if( type == "file"
        && html_input.className.indexOf("image") != -1 ){
        html_input.onchange = function(e){
            var file = e.target.files[0];
            var id = file.name + file.lastModified;
            var reader = new FileReader();
            data_array[index+"_id"] = id;
            reader.onload = function(e){
                store_image(id,e.target.result,callback);
            };
            reader.readAsDataURL(file);
        }
    } else {
        html_input.value = data_array[index];
        /* don't change frame on arrow down! */
        html_input.onkeydown = function(e){
            e.stopPropagation();
        }

        html_input.onkeyup =
            html_input.onchange = function(){
                oldvalue = this.value;
                data_array[index] = this.value;

                callback(
                    html_input,
                    data_array,
                    index,
                    oldvalue
                );
            }
    }
}

function init_spreadsheet
(dom,input,settings,name,callback){
    var table = SQSA(dom,"table")[0];
    var input = SQSA(dom,"input")[0];
    var row_num = 0;
    var col_num = 0;
    var result = [];
    var initial_value;

    if(settings[name] == undefined){
        initial_value = [[0,0],[0,0]];
    } else {
        initial_value = settings[name];
    }
    
    var w = initial_value[0].length;
    var h = initial_value.length;

    // create table of the right size
    for(var i = 0;i < h;i++){
        if(row_num <= i){
            add_row();
        }
        for(var j = 0;j < w;j++){
            if(col_num <= j){
                add_col();
            }
        }
    }

    result = initial_value;
    save();
    
    // i : row
    // j : column
    function add_row(){
        var row = create_dom("tr","");
        table.appendChild(row);
        arr = [];
        for(var i = 0; i < col_num; i++){
            add_cell(row,row_num,i);
            arr.push("0");
        }
        result.push(arr);
        row_num++;
        save();
    }
    function add_col(){
        var rows = SQSA(table,"tr");
        for(var i = 0; i < row_num; i++){
            add_cell(rows[i],i,col_num);
            result[i].push("0");
        }
        col_num++;
        save();
    }
    function add_cell(row,i,j){
        var content = (initial_value[i]||[])[j] || 0;
        var cell = create_dom("td",content);
        cell.contentEditable = "true";

        cell.onkeyup = save;

        cell.onpaste =
            cell.oncopy =
            cell.onkeydown =
            function(e){
                e.stopPropagation();
                if(e.keyCode == 13 || e.keyCode == 40){
                    e.preventDefault();
                    // enter
                    if(i == row_num-1){
                        add_row();
                    }
                    // go to next cell vertically
                    SQSA(row.nextSibling,"td")[j]
                        .focus();
                } else if( e.keyCode == 38){
                    // up
                    // go to previous cell vertically
                    SQSA(row.previousSibling,"td")[j]
                        .focus();
                } else if( e.keyCode == 9
                           && e.shiftKey == false){
                    // tab
                    if (j == col_num - 1){
                        e.preventDefault();
                        add_col();
                    }
                }
                result[i][j] = cell.innerHTML;
                save();
            };
        row.appendChild(cell);
    }
    function save(){
        settings[name] = result;
        callback();
    }
}
