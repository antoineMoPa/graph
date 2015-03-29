new_glaph(QSA(".big-glaph")[0]);

var root;

function new_glaph(container){
    var node_types;
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
        node_types = number_node_types();
        sheet = new_sheet();
        removed_ids = [];
        root.sheet = sheet;
        dragging = null
    }
    
    container.innerHTML = glaph_ui();
    canvas = SQSA(container,"canvas")[0];
    ctx = canvas.getContext("2d");
    enable_global_drag();
    init_board_menu();
    init_add_menu();
    init_panels_ui();
    init_keyboard();

    var nodes = container
        .querySelectorAll(".nodes")[0];

    function resize(){
        w = canvas.width = container.clientWidth;
        h = canvas.height = container.clientHeight;
        draw_links();
    }

    var ls = window.localStorage.saved_node_sheet || "";
    if(ls != ""){
        sheet = JSON.parse(ls);
        init_from_sheet();
    } else {
        sheet = new_sheet();
        add_node("number");
    }

    resize();
    window.addEventListener("resize",resize)
    draw_links();

    function init_from_sheet(){
        var nodes = sheet.nodes;
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i] != false){
                init_node_dom(nodes[i].type,i);
            }
        }
        some_value_has_changed();
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
            var input = SQSA(dom,"input, select")[0];

            if(type == "either"){
                for(var value in set.values){
                    var val = set.values[value];
                    var optdom = create_dom("option");
                    optdom.setAttribute("value",val);
                    optdom.innerHTML = val;
                    input.appendChild(optdom);
                }
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
        node_types.run(sheet.nodes);
        save_to_localstorage();
    }

    function save_to_localstorage(){
        window.localStorage.saved_node_sheet
            = JSON.stringify(sheet);
    }

    function add_node(type){
        var nt = node_types[type];
        var id = sheet.nodes.length;

        sheet.nodes[id] =
            deep_copy({
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

        init_node_dom(type,id)
    }

    function init_node_dom(type,id){
        create_node_dom(nodes, type, function(node){
            var nt = node_types[type];
            enable_node_mouse_down(node);
            node.setAttribute('data-node-id', id);
            create_input_and_outputs(nt, node);

            // create text inputs and stuff
            enable_fields(
                node,
                nt,
                sheet.nodes[id].settings
            );

            node.style.top = sheet.nodes[id].top + "px";
            node.style.left = sheet.nodes[id].left + "px";

            if(nt.oncreate != undefined){
                nt.oncreate(node,id);
            }
        });
    }

    function create_node_dom(nodes, type, callback){
        var html = get_html("node-ui");
        var dom = create_dom("div",html);
        var node = dom.children[0];
        SQSA(node,".node-header")[0]
            .innerHTML = type;
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
        last_clicked_output = this;
        this.style.background = "#fb3";
    }

    function glaph_ui(){
        return get_html("glaph-ui");
    }

    function new_sheet(){
        return {
            nodes:[]
        };
    }

    function init_board_menu(){
        var menu = QSA(".menu-panel-board")[0];

        var action = "clear everything";
        var dom = create_dom("action",action);
        dom.attributes['data-name'] = action;
        menu.appendChild(dom);
        init_button(dom,action);
        
        function init_button(dom,action){
            dom.onclick = function(){
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
            };
        }
    }
    
    function init_add_menu(){
        var menu = QSA(".menu-panel-add")[0];

        for(var i in node_types){
            if(i == "run"){
                continue;
            }
            var nt = node_types[i];
            var dom = create_dom("action",i);
            dom.attributes['data-name'] = i;
            menu.appendChild(dom);
            init_add_button(dom,i);
        }

        function init_add_button(dom,type){
            dom.onclick = function(){
                remove_class(dom.parentNode,"menu-panel-displayed");
                add_node(type);
            };
        }
    }

    function enable_node_mouse_down(node){
        var header = SQSA(node,".node-header")[0];
        window.listen_key("D");
        node.onmousedown = function(e){
            node.style.zIndex = max_z_index;
            max_z_index++;
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
                sheet.nodes[id].top =
                    parseInt(dragging.style.top);
                sheet.nodes[id].left =
                    parseInt(dragging.style.left);

                save_to_localstorage();
            }
            dragging = null;
        }

        window.addEventListener("mousemove",mousemove);
        window.addEventListener("mouseup",mouseup);
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
