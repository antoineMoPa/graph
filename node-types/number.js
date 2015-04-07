function number_node_types(root){
    var root = root;
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
                root.output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                if( updater_time_interval != inputs[0] ){
                    updater_time_interval = inputs[0];
                    if( updater_time_interval > 30 ){
                        if(updater_interval != null){
                            clearInterval(updater_interval);
                            updater_interval = null;
                        }
                        updater_interval = setInterval(
                            function(){
                                root.bnr.run(nodes)
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
        "position node": {
            inputs: ["node id (number)","x","y"],
            info: "Places a node in this interface.<br>"
                + "(Hack the user interface!)",
            icon: "fa-arrows",
            outputs: [],
            settings: {
            },
            oncreate: function(node,id){
                root.output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var n_id = parseInt(inputs[0]);
                var x = inputs[1];
                var y = inputs[2];
                var node_dom = root.node_for_id(n_id);
                if( node_dom != undefined
                    && x != undefined
                    && y != undefined
                  ){
                    node_dom.style.left =
                        parseInt(x)+"px";
                    node_dom.style.top =
                        parseInt(y)+"px";

                    root.draw_links();
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


