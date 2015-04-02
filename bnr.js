/**
   Browser node runner

   Contains the algorithms that parse the nodes
   and calls the "calculate" functions and makes sure
   every input is defined before calculating a node.
*/
function init_bnr(){
    root.bnr = {};
    var climb = null;
    var functions = {};
    
    root.bnr.run_function = function(nodes,name,inputs){
        var func = functions[name];
        // set start result from function input
        if(func == undefined){
            return -1;
        } else {
            nodes[func.start].result = inputs;
            root.bnr.calculate_steps(nodes,func.steps);
            return func.end;
        }
    }

    root.bnr.run = function(nodes){
        var output_nodes = root.output_nodes;
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            if( nodes[i] != false ){
                nodes[i].result = undefined;
            }
            if(nodes[i].type == "function end"){
                root.bnr.define_function(nodes,i);
            }
        }
        for(var i = 0; i < output_nodes.length; i++){
            if(nodes[output_nodes[i]] !== false){
                climb(nodes,output_nodes[i]);
            }
        }
    }

    /**
       This defines a function 
       and it starts with a function end.
       It then climbs back to the start to find
       every step nodes.
       The resulting array can be used to compute
       the function result fast.
     */
    root.bnr.define_function = function(nodes,id){
        // Get tree
        var f_steps = root.bnr
            .reverse_tree(nodes,id);

        // add end
        f_steps.push([id]);
        
        // find function start
        // it should be in the first step
        var f_start = -1;
        for(var j = 0; j < f_steps[0].length; j++){
            var node = nodes[f_steps[0][j]];
            if(node == undefined){
                return -1;
            }
            if( nodes[f_steps[0][j]].type ==
                "function start" ){
                f_start = j;
                break;
            }
        }

        if(f_start == -1){
            root.happy_accident(
                id,
                "cannot find function start"
            )
        } else {
            var name = nodes[f_start].settings.name;
            functions[name] = {
                steps: f_steps,
                start:f_start ,
                end: id,
            };
        }
    };
    
    root.bnr.calculate_steps = function(nodes,steps){
        for(var i = 0; i < steps.length; i++){
            for(var j = 0; j < steps[i].length; j++){
                root.bnr.calculate(nodes, steps[i][j]);
            }
        }
    };

    /**
       Climbs from a node backwards 
       (hence the word "reverse").
       Then gives all the step nodes.
       Starting from the earliest outputs.
    */
    root.bnr.reverse_tree = function(nodes,id,steps){
        var steps = steps || [];

        // Make sure parents results are found
        var inputs = nodes[id].inputs;
        
        var substeps = [];
        for(var i = 0; i < inputs.length; i++){
            substeps.push(inputs[i][0]);
            if(inputs[i][0] != -1){
                root.bnr
                    .reverse_tree(
                        nodes,inputs[i][0],steps
                    );
            }
        }
        if(substeps.length != 0){
            steps.push(substeps);
        }
        return steps;
    }
    
    root.bnr.climb_tree = function(nodes,id){
        // The result can already exist
        if(nodes[id].result != undefined){
            return;
        }
        // Make sure parents results are found
        var inputs = nodes[id].inputs;
        for(var i = 0; i < inputs.length; i++){
            if(inputs[i][0] != -1){
                if(nodes[inputs[i][0]].result == undefined){
                    climb(nodes, inputs[i][0]);
                }
            }
        }
        // find result according to inputs
        root.bnr.calculate(nodes,id);
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
            var r = nodes[outputNode].result;
            if(r != undefined){
                result[i] = r[outputId];
            } else {
                result[i] = undefined
            }
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
