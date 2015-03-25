function number_node_types(){
    return {
        run: number_run,
        addition: {
            inputs: ["element 1","element 2"],
            outputs: ["output"],
            settings: {},
        },
        "number output": {
            inputs: ["number"],
            outputs: [],
            settings: {},
            
        },
        number: {
            inputs: [],
            outputs: ["number"],
            settings: {
                number:{
                    type: "float",
                    value: 0,
                }
            },
        }
    };
}

function number_run(nodes){
    console.log(nodes);
    console.log("some value has changed");
    for(var i = 0; i < nodes.length; i++){
        console.log(nodes[i]);
        console.log(nodes[i].settings.number);
    }
    // find output nodes
    // trace the way back to inputs
    // parse and calculate
    // set result
}
