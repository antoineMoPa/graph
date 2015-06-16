function general_node_types(g_root){
    var g_root = g_root;
    var types = {
        "value output": {
            inputs: ["value/array"],
            outputs: [],
            icon: "fa-table",
            title_info: "Array table output",
            oncreate: function(node,id){
                var node = g_root.node_for_id(id);
                var div = create_dom("div","");
                add_class(div,"value-display");
                SQSA(node,"content")[0].appendChild(div);
                g_root.output_nodes.push(id);
            },
            onresult: function(nodes,id){
                var res = g_root.get_input_result(nodes,id);
                if(Array.isArray(res[0])){
                    output_table(nodes,id,res);
                } else if(typeof(res[0] === 'object')){
                    output_object(nodes,id,res);
                } else {
                    output_value(nodes,id,res);
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = g_root.get_input_result(nodes,id);
                self.result = [res[0]];
            },
            settings: {

            },
        },
        "limit values": {
            inputs: ["array"],
            outputs: ["array"],
            icon: "fa-square-o",
            title_info: "Floor/ceil values",
            info: "Floor or ceil a value or a whole 1D array",
            settings: {
                "min":{
                    type: "float",
                    value: ""
                },
                "max":{
                    type: "float",
                    value: ""
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var has_min = min != "";
                var has_max = max != "";
                var min = parseFloat(self.settings['min']);
                var max = parseFloat(self.settings['max']);
                var res = g_root.get_input_result(nodes,id);
                var arr = deep_copy(res[0]);
                
                function limit(val){
                    if(has_min && val < min){
                        val = min;
                    } else if (has_max && val > max){
                        val = max;
                    }
                    return val;
                }
                
                if(Array.isArray(arr)){
                    for(var i = 0; i < arr.length; i++){
                        arr[i] = limit(arr[i]);
                    }
                } else {
                    arr = limit(arr);
                }
                self.result = [arr];
            }
        },
        "operation": {
            inputs: ["array","array or number"],
            outputs: ["output"],
            icon: "fa-calculator",
            title_info: "Performs operations on arrays or numbers",
            settings: {
                operation:{
                    type: "either",
                    values: ["+","-","*","÷","exponent","modulo"],
                    value: "+",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var settings = nodes[id].settings;
                var a = deep_copy(inputs[0]);
                var b = deep_copy(inputs[1]);
                var res;
                function array_operation(a,b,op){
                    var res = [];
                    if( Array.isArray(a)
                        && Array.isArray(b) ){
                        if(a.length == b.length){
                            res = a.map(function(v,i,arr){
                                return op(v,b[i]);
                            });
                        } else {
                            g_root.happy_accident(
                                id,
                                "The arrays do not " +
                                    " have the same size"
                            );
                            res = [];
                            return;
                        }
                    } else if(Array.isArray(a)) {
                        res = a.map(function(v,i,arr){
                            return op(v,b);
                        });
                    } else if(Array.isArray(b)) {
                        res = b.map(function(v,i,arr){
                            return op(a,v);
                        });
                    } else {
                        res = op(a,b);
                    }
                    return res;
                }

                switch(settings.operation){
                case "+":
                    res = array_operation(a,b,function(a,b){
                        return a + b;
                    });
                    break;
                case "-":
                    res = array_operation(a,b,function(a,b){
                        return a - b;
                    });
                    break;
                case "*":
                    res = array_operation(a,b,function(a,b){
                        return a * b;
                    });
                    break;
                case "exponent":
                    res = array_operation(a,b,function(a,b){
                        return Math.pow(a,b);
                    });
                    break;
                case "modulo":
                    res = array_operation(a,b,function(a,b){
                        return a % b;
                    });
                    break;
                case "÷":
                    res = array_operation(a,b,function(a,b){
                        return a / b;
                    });
                    break;
                }
                self.result = [res];
            }
        },
        "Note": {
            inputs: [],
            outputs: [],
            icon: "fa-pencil",
            title_info: "Just some place to write text",
            settings: {
                text: {
                    type: "text",
                    value: ""
                }
            },
            oncreate: function(node,id){
                var node = g_root.node_for_id(id);
                add_class(node,"note-node");
            },
            onresult: function(nodes,id){
            },
            calculate: function(nodes,id){
            },
        },

    };

    function output_value(nodes,id,res){
        var node = g_root.node_for_id(id);
        var d = SQSA(node,".value-display")[0];
        d.textContent = res[0];
    }

    function output_object(nodes,id,res){
        var node = g_root.node_for_id(id);
        var d = SQSA(node,".value-display")[0];
        d.textContent = JSON.stringify(res[0]);
    }
    
    function output_table(nodes,id,res){
        var data = res[0];
        var node = g_root.node_for_id(id);
        var d = SQSA(node,".value-display")[0];
        d.innerHTML = "";
        var table = create_dom("table","");
        if(data == undefined){
            return;
        }
        for(var i = 0; i < data.length;i++){
            var row = create_dom("tr","");
            if(Array.isArray(data[i])){
                for(var j=0;j<data[i].length;j++){
                    add_cell(data[i][j],row,table);
                }
            } else {
                add_cell(data[i],row,table);
            }
            table.appendChild(row);
        }
        function add_cell(content,row,table){
            var val = content.toFixed(10)+""
            var cell = create_dom("td",val);
            row.appendChild(cell);
        }
        d.appendChild(table);
    }
    
    return types;
}
