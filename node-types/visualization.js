function viz_node_types(root){
    var root = root;
    var types = {
        "chart": {
            inputs: ["x values array","y values array"],
            info: "Plug an array of x values and one for y values",
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
                node.style.width = "400px";
                
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
        var wrapper = d3.select(node)
            .select(".chart svg");

        var min_x = d3.min(xs);
        var min_y = d3.min(ys);
        var max_x = d3.max(xs);
        var max_y = d3.max(ys);
        var data = d3.zip(xs,ys);

        var margin = 40;
        var width = node.clientWidth - 2 * margin;
        var height = 300 - 2 * margin;
        var bar_width = node.clientWidth / data.length;

        wrapper.selectAll("*").remove();
        
        chart = wrapper
            .attr("width", width + 2 * margin)
            .attr("height", height + 2 * margin)
            .append("g")
            .attr("transform","translate("+margin+","+margin+")")
            .attr("width", width)
            .attr("height", height);

        var x_s = d3.scale.linear()
            .domain([min_x,max_x])
            .range([0,width]);

        var y_s = d3.scale.linear()
            .domain([min_y, max_y])
            .range([height,0]);

        var bar = chart 
            .selectAll("g");

        // put data
        
        bar
            .data(data)
            .enter()
            .append("g")
            .attr("width",bar_width)
            .attr("height",height)
            .attr("transform",function(d){
                var x = x_s(d[0]);
                var y = y_s(d[1]);
                if(d[1] < 0){
                    var y = y_s(0);
                }
                                    
                return "translate("+x+","+y+")";
            })
            .append("rect")
            .attr("width",bar_width)
            .attr("height",function(d){
                if(d[1] > 0){
                    return y_s(max_y - d[1]);
                } else {
                    return y_s(d[1] + max_y);
                }
                
            });
        
        // create axes
        x_axis = d3.svg.axis().scale(x_s).orient("bottom");
        y_axis = d3.svg.axis().scale(y_s).orient("left");
        
        var x_axis_group = chart.append("g")
            .attr("transform","translate(0,"+height+")")
            .attr("class","axis x-axis")
            .call(x_axis);
        
        var y_axis_group = chart.append("g")
            .attr("class","axis y-axis")
            .call(y_axis);
    }
    
    return types;
}
