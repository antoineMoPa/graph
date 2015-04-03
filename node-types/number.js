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
        "value output": {
            inputs: ["number"],
            outputs: [],
            settings: {},
            icon: "fa-desktop",
            onresult: function(nodes,id){
                var res = root.get_input_result(nodes,id);
                var node = root.node_for_id(id);
                var d = SQSA(node,".value-display")[0];
                d.innerHTML = res[0];
            },
            oncreate: function(node,id){
                var p = create_dom("p","");
                add_class(p,"value-display");
                SQSA(node,"content")[0].appendChild(p);
                root.output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                self.result = [res[0]];
            }
        },
        "operation": {
            inputs: ["element 1","element 2"],
            outputs: ["output"],
            icon: "fa-calculator",
            settings: {
                operation:{
                    type: "either",
                    values: ["+","-","*","÷","exponent","modulo"],
                    value: "+",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
                var a = inputs[0];
                var b = inputs[1];
                var res;
                switch(settings.operation){
                case "+":
                    res = a + b;
                    break;
                case "-":
                    res = a - b;
                    break;
                case "*":
                    res = a * b;
                    break;
                case "exponent":
                    res = Math.pow(a,b);
                    break;
                case "modulo":
                    res = a % b;
                    break;
                case "÷":
                    res = a / b;
                    break;
                }
                self.result = [];
                self.result[0] = res;
            }
        },
        "convert": {
            inputs: ["element 1"],
            outputs: ["output"],
            icon: "fa-exchange",
            title_info:
            "int to float, number to string, etc.",
            settings: {
                to:{
                    type: "either",
                    values: ["integer","float","string"],
                    value: "integer",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
                var a = inputs[0];
                var res;
                switch(settings.to){
                case "integer":
                    res = parseInt(a);
                    break;
                case "float":
                    res = parseFloat(a);
                    break;
                case "string":
                    res = a.toString();
                    break;
                }
                self.result = [];
                self.result[0] = res;
            }
        },
        "trigonometry": {
            inputs: ["element 1"],
            outputs: ["output"],
            icon: "fa-play",
            title_info: "Sin, Cos, Tan",
            settings: {
                "function":{
                    type: "either",
                    values: ["sin","cos","tan"],
                    value: "sin",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
                var a = inputs[0];
                var res;
                switch(settings["function"]){
                case "sin":
                    res = Math.sin(a);
                    break;
                case "cos":
                    res = Math.cos(a);
                    break;
                case "tan":
                    res = Math.tan(a);
                    break;
                }
                self.result = [];
                self.result[0] = res;
            }
        },
        "condition": {
            inputs: ["number 1","number 2"],
            outputs: ["bool"],
            icon: "fa-question-circle",
            settings: {
                "condition":{
                    type: "either",
                    values: ["<",">","<=",">=","==","!="],
                    value: "<",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
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
                self.result = [];
                self.result[0] = res;
            }
        },
        "logic": {
            inputs: ["bool 1","bool 2"],
            outputs: ["bool"],
            icon: "fa-adjust",
            settings: {
                "operator":{
                    type: "either",
                    values: ["and","or","xor"],
                    value: "and",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
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
                self.result = [];
                self.result[0] = res;
            },

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


