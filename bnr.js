/**
   Browser node runner

   Contains the algorithms that parse the nodes
   and calls the "calculate" functions and makes sure
   every input is defined before calculating a node.
*/
function init_bnr(){
    root.bnr = {};
    var climb = null;
    
    root.bnr.run = function(nodes){
        var output_nodes = root.output_nodes;
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            if( nodes[i] != false
                && nodes[i].system == "number" ){
                nodes[i].result = undefined;
            }
        }
        
        for(var i = 0; i < output_nodes.length; i++){
            if(nodes[output_nodes[i]] !== false){
                if(!climb(nodes,output_nodes[i])){
                    break;
                }
            }
        }
    }
    
    root.bnr.climb_tree = function(nodes,id){
        // The result can already exist
        if(nodes[id].result != undefined){
            return true;
        }
        // Make sure parents results are found
        var inputs = nodes[id].inputs;
        for(var i = 0; i < inputs.length; i++){
            if(inputs[i][0] != -1){
                if(nodes[inputs[i][0]].result == undefined){
                    if(!climb(nodes,inputs[i][0])){
                        return false;
                    }
                }
            }
        }
        // find result according to inputs
        root.bnr.calculate(nodes,id);
        return true;
    }
    climb = root.bnr.climb_tree;
    
    root.bnr.calculate = function(nodes,id){
        var system = nodes[id].system;
        var type = nodes[id].type;
        var nt = root.node_systems[system][type];
        if(nt.calculate != undefined){
            nt.calculate(nodes,id);
        } else {
            console.error(
                "node does not have a calculate function"
            );
        }
        if(nt.onresult != undefined){
            nt.onresult(nodes,id);
        }
    }
    
    root.get_input_result = function(nodes,id){
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
    
    root.node_for_id = function(id){
        return SQSA(
            root.cont,
            "[data-node-id='"+id+"']"
        )[0];
    }
}
