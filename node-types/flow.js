function flow_node_types(root){
    var root = root;
    var output_nodes = [];

    var types = {
        "function call": {
            inputs: ["input 1","input 2","input 3"],
            outputs: ["result 1","result 2","result 3"],
            icon: "fa-arrow-circle-right",
            info: "Hint: you need a start and an end for every function.",
            settings: {
                "name":{
                    type: "string",
                    value: "",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                root.draw_links();
                var end = root.bnr
                    .run_function(
                        nodes,
                        self.settings.name,
                        res
                    );

                if(end == -1){
                    self.result = [null];
                } else {
                    self.result = nodes[end].result;
                }
            }
        },
        "function start": {
            inputs: [],
            info: "Do your things and plug your result to a function end",
            outputs: [
                "output 1",
                "output 2",
                "output 3"
            ],
            icon: "fa-angle-double-left",
            settings: {
                "name":{
                    type: "string",
                    value: "",
                }
            },
            calculate: function(nodes,id){
            }
        },
        "function end": {
            inputs: ["input 1","input 2","input 3"],
            outputs: [],
            icon: "fa-angle-double-right",
            info: "Plug in the return value of your procedure",
            settings: {
            },
            oncreate: function(node,id){
                node.style.minHeight = "110px";
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                self.result = res;
            }
        }
    };

    return types;
}
