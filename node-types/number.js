function number_node_types(){
    var output_nodes = [];
    
    var types = {
        run: number_run,
        "addition": {
            inputs: ["element 1","element 2"],
            outputs: ["output"],
            settings: {},
            calculate: function(nodes,id){
                var self = nodes[id];
                var inputs = get_input_result(nodes,id);
                self.result = [];
                self.result[0] = inputs[0] + inputs[1];
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
                    nodes[id].settings["number"]
                ];
            }
        }
    };
    
    
    function number_run(nodes){
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            nodes[i].result = undefined;
        }
        
        for(var i = 0; i < output_nodes.length; i++){
            climb_tree(nodes,output_nodes[i]);
        }
    }
    
    function climb_tree(nodes,id){
        // The result can already exist
        if(nodes[id].result != undefined){
            return;
        }
        // Make sure parents results are found
        var inputs = nodes[id].inputs;
        for(var i = 0; i < inputs.length; i++){
            if(nodes[inputs[i][0]].result == undefined){
                climb_tree(
                    nodes,
                    inputs[i][0]
                );
            }
        }
        // find result according to inputs
        calculate(nodes,id);
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

            console.log(outputNode,outputId,nodes[outputNode]
                .result)
            
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
