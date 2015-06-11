function logic_node_types(g_root){
    var g_root = g_root;

    var types = {
        "condition": {
            inputs: ["number 1","number 2"],
            outputs: ["bool"],
            settings: {
                "condition":{
                    type: "either",
                    values: ["<",">","<=",">=","==","!="],
                    value: "<",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var settings = self.settings;
                var a = inputs[0];
                var b = inputs[1];
                var res;
                switch(settings["condition"]){
                case "<":
                    res = a < b;
                    break;
                case ">":
                    res = a > b;
                    break;
                case "<=":
                    res = a <= b;
                    break;
                case ">=":
                    res = a >= b;
                    break;
                case "==":
                    res = a == b;
                    break;
                case "!=":
                    res = a != b;
                    break;
                }
                self.result = [res];
            }
        },
        "logic": {
            inputs: ["bool 1","bool 2"],
            outputs: ["bool"],
            settings: {
                "operator":{
                    type: "either",
                    values: ["and","or","xor"],
                    value: "and",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var settings = self.settings;
                var a = inputs[0];
                var b = inputs[1];
                var res;
                switch(settings["operator"]){
                case "and":
                    res = a && b;
                    break;
                case "or":
                    res = a || b;
                    break;
                case "xor":
                    res = (a ? !b : b);
                    break;
                }
                self.result = [res];
            }
        },
        "if switch": {
            inputs: ["bool","value if true","value if not"],
            outputs: ["value"],
            info: "Will return first value if bool is true",
            settings: {
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var a = inputs[0];
                var b = inputs[1];
                var c = inputs[2];
                var res;
                
                if(a == true){
                    res = b;
                } else {
                    res = c;
                }
                self.result = [res];
            }
        }

        
    };
    
    return types;
}
