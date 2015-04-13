function viz_node_types(root){
    var root = root;
    var types = {
        "chart": {
            inputs: ["x values array","y values array"],
            info: "plug an array of x values and one for y values",
            outputs: [],
            icon: "fa-bar-chart",
            oncreate: function(node,id){
                var node = root.node_for_id(id);
                var div = create_dom("div","");
                add_class(div,"chart");
                var content = SQSA(node,"content")[0];
                content.appendChild(div);
                var chart = d3.select(div)
                    .append("svg");
                
                root.output_nodes.push(id);
            },
            onresult: function(nodes,id){
                var node = root.node_for_id(id);
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                graph(node,res,self.settings);
            },
            calculate: function(nodes,id){
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                self.result = [res[0]];
            },
            settings: {
                
            },
        },
    };

    
    function graph(node,res,settings){
        var xs = res[0];
        var ys = res[1];
        var chart = d3.select(node)
            .select(".chart svg");

        var max_x = d3.max(xs);
        var max_y = d3.max(ys);
        var data = d3.zip(xs,ys);

        var width = node.clientWidth;
        var height = 200;
        var bar_width = node.clientWidth / data.length;

        chart.selectAll("*").remove();
        
        chart
            .attr("width",width)
            .attr("height",height);
        
        var bar = chart 
            .selectAll("g");

        bar
            .data(data)
            .enter()
            .append("g")
            .attr("width",bar_width)
            .attr("height",height)
            .attr("transform",function(d){
                var x = d[0] / max_x * width;
                var y = height - d[1] / max_y * height;
                return "translate("+x+","+y+")";
            })
            .append("rect")
            .attr("width",bar_width)
            .attr("height",function(d){
                return d[1] / max_y * height;
            });

    }
    
    return types;
}
