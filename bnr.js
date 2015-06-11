/**
   Browser node runner

   Contains the algorithms that parse the nodes
   and calls the "calculate" functions and makes sure
   every input is defined before calculating a node.
*/
function init_bnr(g_root){
    g_root.bnr = {};
    var functions = {};

    g_root.bnr.run_function = function(nodes,name,inputs){
        var func = functions[name];
        // set start result from function input
        if(func == undefined){
            return -1;
        } else {
            nodes[func.start].result = inputs;
            g_root.bnr.calculate_steps(nodes,func.steps);
            return func.end;
        }
    }

    g_root.bnr.run = function(nodes){
        var output_nodes = g_root.output_nodes;
        // clear past results
        for(var i = 0; i < nodes.length; i++){
            if( nodes[i] != false ){
                nodes[i].result = undefined;
            }
            if(nodes[i].type == "function end"){
                g_root.bnr.define_function(nodes,i);
            }
        }
        for(var i = 0; i < output_nodes.length; i++){
            if(nodes[output_nodes[i]] !== false){
                // Build tree
                var tree = g_root.bnr
                    .reverse_tree(nodes,output_nodes[i]);

                // add output node
                tree.push([output_nodes[i]]);

                // run through steps
                g_root.bnr
                    .calculate_steps(nodes,tree);
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
    g_root.bnr.define_function = function(nodes,id){
        // Get tree
        var f_steps = g_root.bnr
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
                f_start = f_steps[0][j];
                break;
            }
        }

        if(f_start == -1){
            g_root.happy_accident(
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

    g_root.bnr.calculate_steps = function(nodes,steps){
        g_root.bnr.calculate_async(nodes,steps,0);
    };

    /* This is interesting

       It processes layer by layer to compute every node.
       When a node returns "wait", it does not perform the
       next layer right now. It waits for a callback to be
       called (back).

       This allows asynchronous fun like querying the web
       or processing data somewhere.
    */
    g_root.bnr.calculate_async = function(nodes,steps,layer){
        if(layer == undefined){
            layer = 0
        } else if (layer >= steps.length){
            return;
        }
        var block = false;
        var blocking = 0;

        function callback(){
            blocking--;
            if(blocking <= 0){
                g_root.bnr
                    .calculate_async(nodes,steps,layer + 1);
            }
        }

        for(var i = 0; i < steps[layer].length; i++){
            var msg = g_root.bnr
                .calculate(nodes, steps[layer][i],callback);
            if(msg == "wait"){
                block = true;
                blocking++;
            }
        }
        if(!block){
            callback();
        }
    }

    /**
       Climbs from a node backwards
       (hence the word "reverse").
       Then gives all the step nodes.
       Starting from the earliest outputs.
    */
    g_root.bnr.reverse_tree = function(nodes,id,steps){
        var steps = steps || [];

        // Make sure parents results are found
        var inputs = nodes[id].inputs;

        var substeps = [];
        for(var i = 0; i < inputs.length; i++){
            substeps.push(inputs[i][0]);
            if(inputs[i][0] != -1){
                g_root.bnr
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

    g_root.bnr.calculate = function(nodes,id,callback){
        if(id == -1 || nodes[id] == false){
            return;
        }
        var ret;
        var system = nodes[id].system;
        var type = nodes[id].type;
        var nt = g_root.node_systems[system][type];
        if(nt.calculate != undefined){
            ret = nt.calculate(nodes,id,callback);
        } else {
            console.error(
                "node does not have a calculate function"
            );
        }
        if(nt.onresult != undefined){
            nt.onresult(nodes,id);
        }
        return ret;
    }

    g_root.get_input_result = function(nodes,id){
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

    g_root.node_for_id = function(id){
        return SQSA(
            g_root.cont,
            "[data-node-id='"+id+"']"
        )[0];
    }
}
