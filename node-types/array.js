function array_node_types(){
    var output_nodes = [];
    
    var types = {
        run: run,
        "array": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-table",
            settings: {
                "operator":{
                    type: "text",
                    value: "",
                }
            }
        }
    };
    
    function run(nodes){
        ajax.post(
            "http://127.0.0.1:8000",
            {dude:3},
            function(response){
                console.log(response);
            }
        );
    }
    
    return types;
}
