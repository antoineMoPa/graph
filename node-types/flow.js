function flow_node_types(root){
    var root = root;
    var output_nodes = [];
        
    var types = {
        "function call": {
            inputs: ["input"],
            outputs: ["result"],
            icon: "fa-arrow-circle-right",
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
            outputs: ["input"],
            icon: "fa-angle-double-left",
            settings: {
                "name":{
                    type: "string",
                    value: "",
                },
                "number of inputs":{
                    type: "integer",
                    value: "1"
                }
            },
            oncreate: function(nodes,id){
                //var self = nodes[id];
                //var settings = self.settings;
            },
            calculate: function(nodes,id){
                
            }
        },
        "function end": {
            inputs: ["output"],
            outputs: [],
            icon: "fa-angle-double-right",
            settings: {
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                self.result = res;
            }
        },
        "map": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-bars",
            settings: {
                "array":{
                    type: "text",
                    value: "",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = self.settings;
                try{
                    var arr = JSON.parse(settings.array);
                } catch (e){
                    var arr = [];
                }
                self.result = [arr];
            }
        }
    };
    
    return types;
}
