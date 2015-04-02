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
    return el.querySelectorAll(sel);
}

/**
   Adds element as the first child of parent
*/
function prepend(parent,el){
    parent.insertBefore(el,parent.firstChild);
}

/**
   getElementById, but shorter
*/
function ID(id){
    return document.getElementById(id);
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
    }
    if(obj == null){
        return null;
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
            "Error: script '"+name+"' does not exist."
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

function create_dom(tag,content){
    var parent = document.createElement(tag);
    parent.innerHTML = content;
    return parent;
}

function init_panels_ui(){
    var buttons = QSA(".menubar .button");
    for(var i=0; i < buttons.length; i++){
        buttons[i].onclick = function(){
            var id = this.getAttribute("data-panel-id");
            var panel =  ID(id);
            var panelOpened = false;
            if(has_class(panel,"menu-panel-displayed")){
                panelOpened = true;
            }

            close_menu_panels();
            
            if(!panelOpened){
                add_class(panel,"menu-panel-displayed")
            }
        }
    }
}

function close_menu_panels(){
    var displayed = QSA(".menu-panel-displayed");
    for(var i = 0; i < displayed.length; i++){
        var el = displayed[i];
        remove_class(el,"menu-panel-displayed");
    }
}

function init_keyboard(){
    window.keyboard = {};
    keyboard.callbacks = [];
    window.keyboard.keys = {};

    window.listen_key = function(key){
        if(!(key in keyboard.keys)){
            keyboard.keys[key] = false;
        }
    };

    document.onkeydown = function(e){
        str = String.fromCharCode(e.keyCode);
        for(var callback in keyboard.callbacks){
            keyboard.callbacks[callback](e);
        }
        set_current_key(e,true);
    };

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
