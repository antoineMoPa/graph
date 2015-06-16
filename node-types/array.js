function array_node_types(g_root){
    var g_root = g_root;
    var output_nodes = [];

    var types = {
        "array spreadsheet": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-table",
            settings: {
                "table":{
                    type: "spreadsheet",
                    value: [[0,0],[0,0]],
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = nodes[id].settings;
                try{
                    var arr = settings.table;
                } catch (e){
                    var arr = [];
                }
                self.result = [arr];
            }
        },
        "array text input": {
            inputs: [],
            outputs: ["array"],
            icon: "fa-code",
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
        "limit by x values": {
            inputs: ["x","y"],
            outputs: ["x","y"],
            icon: "",
            info: "Returns elements with x values within specified range and if they are a multiple of step",
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
                    value: "0.5",
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var settings = nodes[id].settings;
                var res = g_root.get_input_result(nodes,id);
                var from = parseFloat(settings.from);
                var to = parseFloat(settings.to);
                var step = parseFloat(settings.step) || "";

                var xs = res[0] || [];
                var ys = res[1] || [];
                
                var res = g_root
                    .clip_by_x_values(xs,ys,from,to,step);
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
                var from = parseFloat(settings.from);
                var to = parseFloat(settings.to);
                var step = parseFloat(settings.step);
                var arr = [];

                if(step == 0){
                    g_root.happy_accident(
                        id,
                        "A step of 0 is impossible."
                    )
                } else {
                    for(var i = 0; i*step + from <= to;i++){
                        arr[i] = i * step + from;
                    }
                }
                self.result = [arr];
            }
        },
        "map": {
            inputs: ["array"],
            outputs: ["array"],
            icon: "fa-bars",
            title_info: "run a function on all elements of array",
            info: "Outputs the resulting array",
            settings: {
                "function":{
                    type: "string",
                    value: ""
                }
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var name = self.settings["function"];
                var res = g_root.get_input_result(nodes,id);
                var arr = deep_copy(res[0]);
                for(var i = 0, l = arr.length; i < l;i++){
                    var end = g_root.bnr
                        .run_function(
                            nodes,
                            name,
                            [arr[i]]
                        );
                    if(i == 0 && end == -1){
                        self.result = null;
                        return;
                    } else {
                        arr[i] = nodes[end].result[0];
                    }
                }
                self.result = [arr];
            }
        },
        "column sum": {
            inputs: ["array"],
            outputs: ["array"],
            icon: "fa-cog",
            title_info: "",
            info: "Outputs the sum of the columns",
            settings: {
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var name = self.settings["function"];
                var res = g_root.get_input_result(nodes,id);
                var arr = res[0];
                if(arr == undefined){
                    return;
                }
                if(Array.isArray(arr[0])){
                    // We likely have an array of arrays
                    // Let's return the sum of every
                    // sub array
                    if(arr[0] == null){
                        console.log(arr);
                        self.result = [null];
                        return;
                    }
                    var res_arr = new Array(arr[0].length);
                    for(var i = 0; i < res_arr.length; i++){
                        res_arr[i] = 0;
                    }
                    for(var i = 0; i < arr.length;i++){
                        for(var j = 0; j < arr[i].length;j++){
                            var curr =
                                parseFloat(arr[i][j]) || 0
                            res_arr[j] += curr;
                        }
                    }
                    self.result = [res_arr];
                } else {
                    // We have an array
                    // Lets sum all values
                    var res = 0;
                    for(var i = 0; i < arr.length;i++){
                        res += arr[i] || 0;
                    }
                    self.result = [res];
                }
            }
        }
    };

    /*
      Clip array by x values
      from "from"
      to "to"
      by taking only values at each step
     */
    g_root.tools.clip_x_values = function
    (xs,ys,from,to,step){
        var new_xs = [];
        var new_ys = [];
        
        for(var i = 0; i < xs.length; i++){
            if(xs[i] > from && xs[i] < to){
                if(step != "" && xs[i] % step == 0){
                    new_xs.push(xs[i]);
                    new_ys.push(ys[i]);
                }
            }
        }
        
        self.result = [
            deep_copy(new_xs),
            deep_copy(new_ys)
        ];
    }

    return types;
}
