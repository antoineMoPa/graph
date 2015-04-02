function flow_node_types(root){
    var root = root;
    var output_nodes = [];
        
    var types = {
        "call function": {
            inputs: ["input"],
            outputs: ["result"],
            icon: "fa-table",
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
            icon: "fa-table",
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
            inputs: ["output"],
            outputs: [],
            icon: "fa-table",
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
            icon: "fa-table",
            settings: {
                "array":{
                    type: "text",
                    value: "",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = nodes[id].settings;
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
