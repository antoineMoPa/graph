function QSA(sel){
    return document.querySelectorAll(sel);
}

// sub query selectorAll
function SQSA(el, sel){
    return el.querySelectorAll(sel);
}

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
            
            var displayed = QSA(".menu-panel-displayed");
            for(var i = 0; i < displayed.length; i++){
                var el = displayed[i];
                remove_class(el,"menu-panel-displayed");
            }
            
            if(!panelOpened){
                add_class(panel,"menu-panel-displayed")
            }
        }
    }
}

function init_keyboard(){
    window.keyboard = {};
    keyboard.callbacks = [];
    window.listened_keys = {};

    window.listen_key = function(key){
        if(!(key in listened_keys)){
            listened_keys[key] = false;
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
        for(var key in listened_keys){
            if(e.keyCode == key){
                listened_keys[key] = value;
            } else if (str == key){
                listened_keys[key] = value;
            }
        }
    }

}
