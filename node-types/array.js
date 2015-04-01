function array_node_types(root){
    var root = root;
    var output_nodes = [];
        
    var types = {
        "array text input": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-table",
            info:
            "I understand this format: [1,2,3,4]<br>"
            +"Multi-Dimension: [[1,2,9],[2,3,6],[3,4,6]]",
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
        },
        "range": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-sort-amount-asc",
            info: "Creates an array of values "
                + "with given step",
            settings: {
                "from":{
                    type: "float",
                    value: "0",
                },
                "to":{
                    type: "float",
                    value: "10",
                },
                "step":{
                    type: "float",
                    value: "1",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = nodes[id].settings;
                var from = settings.from;
                var to = settings.to;
                var step = settings.step;
                var arr = [];

                if(step == 0){
                    root.happy_accident(
                        id,
                        "A step of 0 is impossible."
                    )
                } else {
                    for(var i = 0; i*step <= to;i++){
                        arr[i] = i * step;
                    }
                }
                self.result = [arr];
            }
        },
        "operation": {
            inputs: ["array","array or number"],
            outputs: ["output"],
            icon: "fa-calculator",
            info: "performs operations on 1d arrays "+
                "of same size.",
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

                function array_operation(a,b,op){
                    var res = [];
                    if( Array.isArray(a)
                        && Array.isArray(b) ){
                        if(a.length == b.length){
                            res = a.map(function(v,i,arr){
                                return op(v,b[i]);
                            });
                        } else {
                            root.happy_accident(
                                id,
                                "The arrays do not " +
                                    " have the same size"
                            );
                            res = [];
                        }
                    } else if(Array.isArray(a)) {
                        res = a.map(function(v,i,arr){
                            return op(v,b);
                        });
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
        "output": {
            inputs: ["d3.js array"],
            outputs: [],
            icon: "fa-desktop",
            title_info: "D3.js Array",
            onresult: function(nodes,id){
                var res = root.get_input_result(nodes,id);
                var node = root.node_for_id(id);
                var d = SQSA(node,".value-display")[0];
                d.innerHTML = JSON.stringify(res[0]);
            },
            oncreate: function(node,id){
                var p = create_dom("p","");
                add_class(p,"value-display");
                SQSA(node,"content")[0].appendChild(p);
                root.output_nodes.push(id);
            },
            calculate: function(){},
            settings: {
                
            },
            
        }
    };
    
    
    return types;
}
