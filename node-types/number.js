function number_node_types(){
    var output_nodes = [];

    var types = {
        run: number_run,
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
        "number output": {
            inputs: ["number"],
            outputs: [],
            settings: {},
            onresult: function(nodes,id){
                var res = get_input_result(nodes,id);
                var node = node_for_id(id);
                var d = SQSA(node,".number-display")[0];
                d.innerHTML = res[0];
            },
            oncreate: function(node,id){
                var p = create_dom("p","");
                add_class(p,"number-display");
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
            calculate: function(nodes,id){
                var self = nodes[id];
                self.result = [
                    parseFloat(nodes[id].settings["number"])
                ];
            }
        }
    };


    function number_run(nodes){
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            if(nodes[i] != false){
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

    function node_run(node,inputs){
        var outputs = [];
        return outputs;
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
        return QSA("[data-node-id='"+id+"']")[0];
    }

    return types;
}
