new_graph(QSA(".big-graph")[0]);

var root;

function new_graph(container){
    var node_systems;
    var dragging;
    var canvas = null;
    var ctx = null;
    var w = 0;
    var h = 0;
    var last_clicked_output = null;
    // Empty available slots in nodes
    var removed_ids;
    var max_z_index = 1;
    
    init_globals();
    
    function init_globals(){
        root = {};
        root.cont = container;
        root.draw_links = draw_links;
        root.output_nodes = [];
        root.happy_accident = happy_accident;
        root.node_systems = 
            node_systems = {
                general: general_node_types(root),
                web: web_node_types(root),
                flow: flow_node_types(root),
                number: number_node_types(root),
                logic: logic_node_types(root),
                array: array_node_types(root),
                visualization: viz_node_types(root),
                spectrum: spectrum_node_types(root)
            }
        init_bnr(root);
        sheet = new_sheet();
        removed_ids = [];
        root.sheet = sheet;
        dragging = null;
    }
    
    container.innerHTML = graph_ui();
    canvas = SQSA(container,"canvas")[0];
    ctx = canvas.getContext("2d");
    enable_global_drag();
    init_board_menu();
    init_add_menu();
    init_panels_ui();
    init_keyboard();
    enable_move_sheet();
    
    var nodes = container
        .querySelectorAll(".nodes")[0];
    
    function resize(){
        w = canvas.width = container.clientWidth;
        h = canvas.height = container.clientHeight;
        draw_links();
    }

    var storage = window.localStorage;
    var ls = storage.saved_node_sheet || DEFAULT_SHEET;

    root.sheet = 
        sheet = JSON.parse(ls);
    
    init_from_sheet(sheet);


    resize();
    window.addEventListener("resize",resize)
    draw_links();

    function init_from_sheet(sh){
        sheet = sh;
        var nodes = sh.nodes;
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i] != false){
                init_node_dom(
                    nodes[i].system,                    
                    nodes[i].type,
                    i
                );
            }
        }
        some_value_has_changed();
        draw_links();
    }

    /**
       To be called when adding a node /
       after nodes appear like at page reload
    */
    function enable_fields(node,node_type,settings){
        var nt = node_type;
        for(var name in nt.settings){
            set = nt.settings[name];
            var type = set.type;
            var html = get_html(type+"-input-ui");
            var dom = create_dom("div",html);
            // I feel like a javascript
            // ninja right now
            SQSA(dom,"label")[0].innerHTML = name;
            var input = SQSA(
                dom,"input, select, textarea")[0];

            if(type == "either"){
                for(var value in set.values){
                    var val = set.values[value];
                    var optdom = create_dom("option");
                    optdom.setAttribute("value",val);
                    optdom.innerHTML = val;
                    input.appendChild(optdom);
                }
            } else if (type == "spreadsheet"){
                init_spreadsheet(
                    dom,
                    input,
                    settings,
                    name,
                    some_value_has_changed
                );
            }

            input.setAttribute(
                "data-name",
                name
            );
            
            SQSA(node,"content")[0].appendChild(dom);
        }
        initInputs(node,settings,some_value_has_changed);
    }
    
    function some_value_has_changed(){
        clear_happy_errors();
        root.bnr.run(sheet.nodes);
        save_to_localstorage();
    }

    function save_to_localstorage(){
        window.localStorage.saved_node_sheet
            = JSON.stringify(sheet);
    }

    function add_node(system,type){
        var nt = node_systems[system][type];
        var id = sheet.nodes.length;
        sheet.nodes[id] =
            deep_copy({
                system: system,
                type: type,
                top: 200,
                left: 200,
                inputs: empty_inputs(),
                settings: empty_settings()
            });
        function empty_inputs(){
            var arr = Array(nt.inputs.length);
            for(var i = 0; i < arr.length; i++){
                arr[i] = [-1,-1];
            }
            return arr;
        }

        function empty_settings(){
            var arr = {};
            for(var i in nt.settings){
                arr[i] = nt.settings[i].value;
            }
            return arr;
        }

        save_to_localstorage();

        init_node_dom(system,type,id)
    }

    function init_node_dom(system,type,id){
        create_node_dom(nodes, system, type, function(node){
            if( node_systems[system] != undefined
                && node_systems[system][type] != undefined
              ){
                var nt = node_systems[system][type];
            } else {
                console.log(
                    "Type " +
                        type +
                        " in system " +
                        system +
                        " was not found!"
                );
            }
            enable_node_mouse_down(node);
            node.setAttribute('data-node-id', id);
            create_input_and_outputs(nt, node);

            // create text inputs and stuff
            enable_fields(
                node,
                nt,
                sheet.nodes[id].settings
            );

            // add info

            if(nt.info != undefined){
                var p = create_dom("p",nt.info);
                SQSA(node,"content")[0]
                    .appendChild(p);
            }
            
            node.style.top = sheet.nodes[id].top + "px";
            node.style.left = sheet.nodes[id].left + "px";
            bring_node_to_top(node);
            
            if(nt.oncreate != undefined){
                nt.oncreate(node,id);
            }
        });
    }

    function bring_node_to_top(node){
        node.style.zIndex = max_z_index;
        max_z_index++;
    }
    
    function create_node_dom(nodes, system, type, callback){
        var html = get_html("node-ui");
        var dom = create_dom("div",html);
        var node = dom.children[0];
        var header = SQSA(node,".node-header")[0];
        var delete_button = SQSA(node,".delete-node")[0];
        delete_button.onclick = function(){
            var id = node.getAttribute("data-node-id");
            remove_node(id);
        };
        header.innerHTML = type;
        var sys = node_systems[system][type];
        var content = SQSA(node,"content")[0];
        nodes.appendChild(
            node
        );
        callback(node)
    }

    function create_input_and_outputs(nt,node){
        var html = get_html("node-output-ui");
        var outputs = SQSA(node,".node-outputs")[0];
        for(var i = 0; i < nt.outputs.length; i++){
            var dom = create_dom("div",html);
            outputs.appendChild(dom.children[0]);

            var output = outputs
                .children[outputs.children.length -1];

            output.title = nt.outputs[i];
            output.setAttribute("data-output-id",i);
            output.onclick = node_output_click;
        }

        var html = get_html("node-input-ui");

        for(var i = 0; i < nt.inputs.length; i++){
            var inputs = SQSA(node,".node-inputs")[0];
            var dom = create_dom("div",html);
            inputs.appendChild(dom.children[0]);
            var input = inputs
                .children[i];
            input.setAttribute("data-input-id",i);
            input.title = nt.inputs[i];
            input.onclick = node_input_click;
        }
    }

    function node_input_click(e){
        if(last_clicked_output != null){
            var l = last_clicked_output;
            var output_node_id = l.parentNode.parentNode
                .getAttribute("data-node-id");
            var output_id = l
                .getAttribute("data-output-id");

            var input_node_id = this.parentNode.parentNode
                .getAttribute("data-node-id");
            var input_id = this
                .getAttribute("data-input-id");

            l.style.background = "#ddd";

            if(output_node_id != input_node_id){
                add_link(
                    output_node_id,
                    output_id,
                    input_node_id,
                    input_id
                )
            }
            last_clicked_output = null;
        } else {
            var input_node_id = this.parentNode.parentNode
                .getAttribute("data-node-id");
            var input_id = this
                .getAttribute("data-input-id");

            remove_link(
                input_node_id,
                input_id
            )
        }
    }

    function add_link(fromNode,fromOutput,toNode,toInput){
        sheet.nodes[toNode]
            .inputs[toInput] = [fromNode,fromOutput];
        draw_links();
        some_value_has_changed();
    }

    function remove_link(toNode,toInput){
        sheet.nodes[toNode]
            .inputs[toInput] = [-1,-1];
        draw_links();
        some_value_has_changed();
    }


    function node_output_click(e){
        if(last_clicked_output != null){
            last_clicked_output.style.background = "#ddd";
        }
        last_clicked_output = this;
        this.style.background = "#fb3";
    }

    function graph_ui(){
        return get_html("graph-ui");
    }

    function new_sheet(){
        return {
            nodes:[]
        };
    }

    function data_popup(data){
        var content = "";
        
        var div = create_dom("div.data-popup","");
        var content = create_dom("div","");
        var close_button = create_dom(
            "div.close-button.btn",
            "Close"
        );
        
        if(typeof data == 'string'){
            content.innerHTML = data;
        } else {
            content.appendChild(data);
        }

        div.appendChild(close_button);
        div.appendChild(content);
        close_button.onclick = remove;
        document.body.appendChild(div);

        function remove(){
            document.body.removeChild(div);
        }
        
        return {
            remove: remove
        };
    }
    
    function init_board_menu(){
        var menu = QSA(".menu-panel-board")[0];

        var actions = [
            {
                name: "Save",
                icon: "fa-cloud-download",
                action: function(){
                    var data = deep_copy(root.sheet);
                    for(var i = 0; i < data.nodes.length; i++){
                        data.nodes[i].result = undefined;
                    }
                    data_popup(JSON.stringify(data));
                }
            },
            {
                name: "Load",
                icon: "fa-upload",
                action: function(){
                    var form = create_dom("div.load-form");
                    var text = create_dom(
                        "textarea.load-data","");
                    var btn = create_dom(
                        "a.btn.load-data-btn","LOAD");
                    form.appendChild(text);
                    form.appendChild(create_dom("br"));
                    form.appendChild(btn);
                    var p = data_popup(form);
                    btn.onclick = function(){
                        clear_sheet();
                        init_globals();
                        init_from_sheet(
                            JSON.parse(text.value)
                        );
                        p.remove();
                    };
                }
            },
            {
                name: "Load default sheet",
                icon: "fa-refresh",
                action: function(){
                    clear_sheet();
                    init_globals();
                    init_from_sheet(
                        JSON.parse(DEFAULT_SHEET)
                    );
                }
            },
            {
                name: "clear everything",
                icon: "fa-trash-o",
                action: function(){
                    clear_sheet();
                }
            }
        ];

        for(var i = 0; i < actions.length; i++){
            var action = actions[i];
            var dom = create_dom("action",action.name);
            dom.attributes['data-name'] = action.name;
            menu.appendChild(dom);
            init_button(dom,action.action);
            prepend_fa_icon(dom,action.icon);
            
        }
                
        function init_button(dom,action){
            dom.onclick = function(){
                close_menu_panels();
                action();
            };
        }
    }

    function clear_sheet(){
        init_globals();
        var nodes = QSA(".node");
        for(var i = 0; i < nodes.length;i++){
            if(nodes[i].tagName != "canvas"){
                nodes[i].parentNode
                    .removeChild(nodes[i]);
            }
        }
        some_value_has_changed();
        draw_links();
    }
    
    /**
       Happy little panel
    */
    function init_add_menu(){
        var menu = QSA(".menu-panel-add")[0];
        
        for(var i in node_systems){
            var node_types = node_systems[i];
            var sub_panel = create_dom("subpanel","");
            var title = create_dom("h3",i);
            sub_panel.appendChild(title);
            for(var j in node_types){
                if(j == "run"){
                    continue;
                }
                var nt = node_types[j];
                var dom = create_dom("action",j);
                dom.setAttribute('data-name',j);
                if(nt.title_info != undefined){
                    dom.setAttribute('title',nt.title_info);
                }
                sub_panel.appendChild(dom);
                init_add_button(dom,i,j);

                // Add happy little font-awesome icons
                if(nt.icon != undefined && nt.icon != ""){
                    prepend_fa_icon(dom,nt.icon);
                }
            }
            menu.appendChild(sub_panel);
        }
        function init_add_button(dom,system,type){
            dom.onclick = function(){
                close_menu_panels();
                add_node(system,type);
            };
        }
        
    }

    function prepend_fa_icon(element,icon){
        var i_dom = create_dom("i","");
        add_class(i_dom, "fa");
        add_class(i_dom, icon);
        prepend(element,i_dom);
    }
    
    function enable_node_mouse_down(node){
        var header = SQSA(node,".node-header")[0];
        window.listen_key("D");
        node.onmousedown = function(e){
            bring_node_to_top(node);
        }
        header.onmousedown = function(e){
            if(keyboard.keys["D"]){
                // delete node
                var id = node
                    .getAttribute("data-node-id");
                
                remove_node(id);
            } else {
                // start drag
                dragging = node;
                start_drag(e);
            }
        }
    }

    function remove_node(id){
        var node = get_node(id);
        // This is how you remove a node in js
        node.parentNode.removeChild(node);
        removed_ids.push(id);
        sheet.nodes[id] = false;
        clear_references_to_node(id);
        draw_links();
    }

    function clear_references_to_node(id){
        var nodes = sheet.nodes;
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];
            if(node == false){
                continue;
            }
            for(var j = 0; j < node.inputs.length; j++){
                var input = node.inputs[j];
                if(input[0] == id){
                    input[0] = -1;
                    input[1] = -1;
                }
            }
        }

        some_value_has_changed();
        draw_links();
    }

    function start_drag(e){
        root.initial_drag_pos = get_pos(e);
        root.initial_drag_el_pos = get_el_pos(dragging);
    }

    function get_pos(e){
        var x = e.clientX
            - window.scrollX - container.clientLeft;
        var y = e.clientY
            - window.scrollY - container.clientTop;
        return [x,y];
    }

    function get_pos_diff(p1,p2){
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        return [dx,dy];
    }

    function get_el_pos(el){
        var x = el.offsetLeft;
        var y = el.offsetTop;
        return [x,y];
    }

    function set_el_pos(el,pos){
        el.style.left = pos[0] + "px";
        el.style.top = pos[1] + "px";
    }

    function move_all_nodes(nodes,left,top){
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i] == false){
                continue;
            }
            set_node_position(
                i,
                nodes[i].left + left,
                nodes[i].top + top
            );
        }
        draw_links();
        save_to_localstorage();
    }
    
    function enable_move_sheet(){
        var last_move = new Date().getTime();
        /*
          Nice move function distance
          that depends on time since last move
          
          Improvement idea: make it depend on key
          
         */
        function move_dist(){
            var current_move = new Date().getTime();
            // I found this value friendly
            var factor = 1000;
            // Value that depends on last click
            var add = factor * 1/(current_move - last_move);
            last_move = current_move;
            return add;
        }
        // move up
        listen_keycode(38,function(e){
            move_all_nodes(sheet.nodes,0,move_dist());
        });
        // right
        listen_keycode(39,function(e){
            move_all_nodes(sheet.nodes,-move_dist(),0);
        });
        // down
        listen_keycode(40,function(e){
            move_all_nodes(sheet.nodes,0,-move_dist());
        });
        // left
        listen_keycode(37,function(e){
            move_all_nodes(sheet.nodes,move_dist(),0);
        });
    }
    
    function enable_global_drag(){
        var last_update = new Date().getTime();

        function mousemove(e){
            var now = new Date().getTime();
            if(now - last_update > 40){
                if(dragging != null){
                    var current_pos = get_pos(e);
                    diff = get_pos_diff(
                        root.initial_drag_pos,
                        current_pos
                    );
                    diff[0] += root.initial_drag_el_pos[0];
                    diff[1] += root.initial_drag_el_pos[1];
                    set_el_pos(dragging,diff);
                    last_update = now;
                    draw_links();
                }
            }
        }

        function mouseup(){
            if(dragging != null){
                var id = dragging
                    .getAttribute("data-node-id");
                set_node_position(id);
                save_to_localstorage();
            }
            dragging = null;
        }
        
        window.addEventListener("mousemove",mousemove);
        window.addEventListener("mouseup",mouseup);
    }

    function set_node_position(id,left,top){
        var node_dom_el = get_node(id);
        if(left == undefined){
            left = node_dom_el.style.left;
        }
        if(top == undefined){
            top = node_dom_el.style.top;
        }
        set_el_pos(node_dom_el,[left,top]);
        sheet.nodes[id].left = parseInt(left);
        sheet.nodes[id].top = parseInt(top);

    }
    
    function draw_links(){
        ctx.clearRect(0,0,w,h);
        var nodes = sheet.nodes;
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i] === false){
                continue;
            }
            var inputs = nodes[i].inputs;
            for(var j = 0; j < inputs.length; j++){
                var input = inputs[j];
                if( input[0] != -1
                    && input[1] != -1 ){
                    out_socket =
                        get_output([input[0],input[1]]);
                    in_socket =
                        get_input([i,j]);
                    
                    draw_socket_link(out_socket,in_socket);
                }
            }
        }
    }

    function get_node(id){
        var sel = ".node[data-node-id='"+
            id +
            "']";

        return SQSA(
            nodes,
            sel
        )[0];
    }

    function get_input(arr){
        var sel = ".node[data-node-id='"+
            arr[0]+
            "']";
        sel += " .node-input[data-input-id='"+
            arr[1]+
            "']";
        return SQSA(
            nodes,
            sel
        )[0];
    }
    function get_output(arr){
        var sel = ".node[data-node-id='"+
            arr[0]+
            "']";
        sel += " .node-output[data-output-id='"+
            arr[1]+
            "']";

        return QSA(
            sel
        )[0];
    }
    function draw_socket_link(fromSocket,toSocket){
        var x = socket_offset_left(fromSocket);
        var y = socket_offset_top(fromSocket);
        var toX = socket_offset_left(toSocket);
        var toY = socket_offset_top(toSocket);
        draw_line(x,y,toX,toY);
    }

    function socket_offset_left(socket){
        return socket
            .offsetLeft +
            socket
            .parentNode
            .parentNode
            .offsetLeft + 8;
    }

    function socket_offset_top(socket){
        return socket.offsetTop +
            socket
            .parentNode
            .parentNode
            .offsetTop + 8;
    }


    function draw_line(x,y,toX,toY){
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.beginPath();
        ctx.moveTo(x,y);
        if(x < toX){
            ctx.bezierCurveTo(
                x+(toX-x)/2, y,
                toX-(toX-x)/2, toY,
                toX, toY
            );
        }
        else{
            ctx.bezierCurveTo(
                    -(toX-x)+x, 1/4*(toY-y)+y,
                toX-(x-toX), 3/4*(toY-y)+y,
                toX, toY
            );
        }
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,1)";
    }

    /**
       There are no mistakes, only
       happy little accidents!
       
       Sends a message to the user in the node
       
       Gets cleared at every run
    */
    function happy_accident(node_id, message){
        var dom = create_dom("happyerror",message);
        root.node_for_id(node_id).appendChild(dom);
    }

    function clear_happy_errors(){
        var errs = QSA("happyerror");
        for(var i = 0; i < errs.length; i++){
            var el = errs[i];
            el.parentNode.removeChild(el);
        }
    }
}

run_tests();

function run_tests(){
    assert(
        get_html("test").indexOf("<div></div>") != -1,
        "Get html part"
    );
    assert(
        create_dom("div","<p>POTATO</p>")
            .querySelectorAll("p")[0]
            .innerHTML == "POTATO",
        "create dom"
    );
}
