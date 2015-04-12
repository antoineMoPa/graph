function general_node_types(root){
    var root = root;
    var types = {
        "value output": {
            inputs: ["value/array"],
            outputs: [],
            icon: "fa-table",
            title_info: "Array table output",
            oncreate: function(node,id){
                var node = root.node_for_id(id);
                var div = create_dom("div","");
                add_class(div,"value-display");
                SQSA(node,"content")[0].appendChild(div);
                root.output_nodes.push(id);
            },
            onresult: function(nodes,id){
                var res = root.get_input_result(nodes,id);
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
                var res = root.get_input_result(nodes,id);
                self.result = [res[0]];
            },
            settings: {

            },
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
                var node = root.node_for_id(id);
                add_class(node,"note-node");
            },
            onresult: function(nodes,id){
            },
            calculate: function(nodes,id){
            },
        },

    };

    function output_value(nodes,id,res){
        var node = root.node_for_id(id);
        var d = SQSA(node,".value-display")[0];
        d.textContent = res[0];
    }

    function output_object(nodes,id,res){
        var node = root.node_for_id(id);
        var d = SQSA(node,".value-display")[0];
        d.textContent = JSON.stringify(res[0]);
    }
    
    function output_table(nodes,id,res){
        var data = res[0];
        var node = root.node_for_id(id);
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
            var cell = create_dom("td",content);
            row.appendChild(cell);
        }
        d.appendChild(table);
    }
    
    return types;
}
