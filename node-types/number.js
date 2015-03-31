function number_node_types(root){
    var root = root;
    var output_nodes = [];
    var updater_interval = null;
    var updater_time_interval = 0;
    
    var types = {
        run: run,
        "operation": {
            inputs: ["element 1","element 2"],
            outputs: ["output"],
            settings: {
                operation:{
                    type: "either",
                    values: ["+","-","*","÷","exponent","modulo"],
                    value: "+",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
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
            settings: {
                to:{
                    type: "either",
                    values: ["integer","float","string"],
                    value: "integer",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
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
            settings: {
                "function":{
                    type: "either",
                    values: ["sin","cos","tan"],
                    value: "sin",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
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
        "value output": {
            inputs: ["number"],
            outputs: [],
            settings: {},
            onresult: function(nodes,id){
                var res = get_input_result(nodes,id);
                var node = node_for_id(id);
                var d = SQSA(node,".value-display")[0];
                d.innerHTML = res[0];
            },
            oncreate: function(node,id){
                var p = create_dom("p","");
                add_class(p,"value-display");
                SQSA(node,"content")[0].appendChild(p);
                output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = get_input_result(nodes,id);
                self.result = [];
                self.result = [res[0]];
            }
        },
        "number": {
            inputs: [],
            outputs: ["number"],
            settings: {
                number:{
                    type: "float",
                    value: 0,
                }
            },
            oncreate: function(nodes,id){

            },
            calculate: function(nodes,id){
                var self = nodes[id];
                self.result = [
                    parseFloat(nodes[id].settings["number"])
                ];
            }
        },
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
                var inputs = get_input_result(nodes,id);
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
            settings: {
                "operator":{
                    type: "either",
                    values: ["and","or","xor"],
                    value: "and",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
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
            outputs: [],
            settings: {
            },
            oncreate: function(node,id){
                output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
                if( updater_time_interval != inputs[0] ){
                    updater_time_interval = inputs[0];
                    if( updater_time_interval > 30 ){
                        if(updater_interval != null){
                            clearInterval(updater_interval);
                            updater_interval = null;
                        }
                        updater_interval = setInterval(
                            function(){
                                run(nodes)
                            },
                            updater_time_interval
                        );
                    }
                }
            },
        },
        "position node": {
            inputs: ["node id (number)","x","y"],
            info: "Places a node in this interface.<br>"
            + "(Hack the user interface!)",
            outputs: [],
            settings: {
            },
            oncreate: function(node,id){
                output_nodes.push(id);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
                var n_id = parseInt(inputs[0]);
                var x = inputs[1];
                var y = inputs[2];
                var node_dom = node_for_id(n_id);
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
        }

    };

    function run(nodes){
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            if( nodes[i] != false
                && nodes[i].system == "number" ){
                nodes[i].result = undefined;
            }
        }

        for(var i = 0; i < output_nodes.length; i++){
            if(nodes[i] != false){
                if(!climb_tree(nodes,output_nodes[i])){
                    break;
                }
            }
        }
    }

    function climb_tree(nodes,id){
        // The result can already exist
        if(nodes[id].result != undefined){
            return true;
        }
        // Make sure parents results are found
        var inputs = nodes[id].inputs;
        for(var i = 0; i < inputs.length; i++){
            if(inputs[i][0] != -1){
                if(nodes[inputs[i][0]].result == undefined){
                    if(!climb_tree(nodes,inputs[i][0])){
                        return false;
                    }
                }
            }
        }
        // find result according to inputs
        calculate(nodes,id);
        return true;
    }

    function calculate(nodes,id){
        var nt = types[nodes[id].type];
        nt.calculate(nodes,id);
        if(nt.onresult != undefined){
            nt.onresult(nodes,id);
        }
    }

    function get_input_result(nodes,id){
        var inputs = nodes[id].inputs;
        var result = [];
        for(var i = 0; i < inputs.length; i++){
            var outputNode = nodes[id].inputs[i][0];
            var outputId = nodes[id].inputs[i][1];
            if(outputNode == -1 || outputId == -1){
                result[i] = undefined;
                continue;
            }
            result[i] =
                nodes[outputNode]
                .result[outputId];
        }
        return result;
    }
    
    function node_for_id(id){
        return SQSA(root.cont,"[data-node-id='"+id+"']")[0];
    }

    return types;
}
