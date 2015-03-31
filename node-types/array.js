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
            title_info: "D3.js Array",
            settings: {
                "array":{
                    type: "text",
                    value: "",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = nodes[id].settings;
                var arr = JSON.parse(settings.array);
                self.result = [arr];
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
                d.innerHTML = res[0];
            },
            oncreate: function(node,id){
                var p = create_dom("p","");
                add_class(p,"value-display");
                SQSA(node,"content")[0].appendChild(p);
                root.output_nodes.push(id);
            },
            settings: {
                
            },
            
        }

    };
    
    
    return types;
}
