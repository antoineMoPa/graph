function number_node_types(g_root){
    var g_root = g_root;
    var updater_interval = null;
    var updater_time_interval = 0;
    
    var types = {
        "number": {
            inputs: [],
            outputs: ["number"],
            icon: "fa-calculator",
            settings: {
                number:{
                    type: "float",
                    value: 0,
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                self.result = [
                    parseFloat(nodes[id].settings["number"])
                ];
            }
        },
        "time": {
            inputs: [],
            outputs: ["unix timestamp"],
            info: "Unix timestamp in milliseconds.",
            icon: "fa-clock-o",
            settings: {
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res;
                self.result = [];
                self.result[0] = new Date().getTime();
            },
        },
        "updater": {
            inputs: ["time (ms)"],
            info: "Causes app to recalculate everything "
                + "at a certain frequency "
                + "(Must be > 30 ms).",
            icon: "fa-refresh",
            outputs: [],
            settings: {
            },
            oncreate: function(node,id){
                g_root.output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                if( updater_time_interval != inputs[0] ){
                    updater_time_interval = inputs[0];
                    if( updater_time_interval > 30 ){
                        if(updater_interval != null){
                            clearInterval(updater_interval);
                            updater_interval = null;
                        }
                        updater_interval = setInterval(
                            function(){
                                g_root.bnr.run(nodes)
                            },
                            updater_time_interval
                        );
                    } else {
                        clearInterval(updater_interval);
                        updater_interval = null;
                    }
                }
            },
        },
        "trigonometry": {
            inputs: ["number"],
            outputs: ["output"],
            icon: "fa-circle-thin",
            settings: {
                "function":{
                    type: "either",
                    values: ["sin","cos","tan"],
                    value: "sin",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var settings = self.settings;
                var a = inputs[0];
                var operation;
                switch(settings["function"]){
                case "sin":
                    operation = function(a){
                        return Math.sin(a);
                    }
                    break;
                case "cos":
                    operation = function(a){
                        return Math.cos(a);
                    }
                    break;
                case "tan":
                    operation = function(a){
                        return Math.tan(a);
                    }
                    break;
                }

                var res;
                if(Array.isArray(a)){
                    res = [];
                    for(var i = 0; i < a.length; i++){
                        res[i] = operation(a[i]);
                    }
                } else {
                    res = operation(a);
                }
                
                self.result = [res];
            }
        },
        "position node": {
            inputs: ["node id (number)","x","y"],
            info: "Places a node in this interface.<br>"
                + "(Hack the user interface!)",
            icon: "fa-arrows",
            outputs: [],
            settings: {
            },
            oncreate: function(node,id){
                g_root.output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var n_id = parseInt(inputs[0]);
                var x = inputs[1];
                var y = inputs[2];
                var node_dom = g_root.node_for_id(n_id);
                if( node_dom != undefined
                    && x != undefined
                    && y != undefined
                  ){
                    node_dom.style.left =
                        parseInt(x)+"px";
                    node_dom.style.top =
                        parseInt(y)+"px";

                    g_root.draw_links();
                }
            },
        },
        "string": {
            inputs: [],
            info: "",
            icon: "fa-font",
            outputs: ["string"],
            settings: {
                string: {
                    type: "text",
                    value: ""
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                self.result = [nodes[id].settings["string"]];
            },
        }
    };

    return types;
}
