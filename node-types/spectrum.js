function spectrum_node_types(root){
    var root = root;
    var cie_data = null;
    var lspdd_lamps = {};
    var lspdd_url = "http://galileo.graphycs.cegepsherbrooke.qc.ca/app/en/lamps/#ID#.json"
    var types = {
        "spectrum output": {
            inputs: ["wavelength","intensity"],
            info: "Spectrum",
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
        "CIE data": {
            inputs: [],
            info: "CIE data",
            outputs: ["wavelength","intensity"],
            icon: "fa-lightbulb-o",
            oncreate: function(node,id){
                var node = root.node_for_id(id);
                var div = create_dom("div","");
            },
            onresult: function(nodes,id){
                var node = root.node_for_id(id);
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                
                // Find CIE data if it is not yet cached
                if(cie_data == null){
                    // We send a callback executed after data is found
                    fetch_cie_data(calculate_cie_data);
                } else {
                    // Data is already cached in cie_data
                    // jump to function
                    calculate_cie_data();
                }
                
                function calculate_cie_data(){
                    var wanted_column = self.settings.data;
                    // return wavelength and the desired column
                    self.result = [cie_data['wavelength'],cie_data[wanted_column]];
                    // Tell node runner to look again
                    // to find now available result
                    callback();
                }
                
            },

            settings: {
                "data": {
                    type: "either",
                    values: [
                        "D65",
                        "X_1964","Y_1964","Z_1964",
                        "X_1931","Y_1931","Z_1931",
                        "CIE_A",
                        "S0","S1","S2"
                    ],
                    value: "D65"
                }
            }
        },
        "LSPDD lamp spectrum": {
            inputs: [],
            info: "CIE data",
            outputs: ["wavelength","intensity"],
            icon: "fa-lightbulb-o",
            oncreate: function(node,id){
                var node = root.node_for_id(id);
                var div = create_dom("div","");
            },
            onresult: function(nodes,id){
                var node = root.node_for_id(id);
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                var lamp_id = self.settings['lamp id'];
                
                // Find CIE data if it is not yet cached
                if(lspdd_lamps[lamp_id] == null){
                    // We send a callback executed after data is found
                    fetch_lspdd_lamp(lamp_id, calculate_lspdd_lamp);
                } else {
                    // Data is already cached in cie_data
                    // jump to function
                    calculate_lspdd_lamp();
                }
                
                function calculate_lspdd_lamp(){
                    var lamp = lspdd_lamps[lamp_id];
                    var spectrum = lamp["spectraldata"];
                    var wavelengths = spectrum["wavelength"];
                    var intensities = spectrum["relativeIntensity"];
                    
                    self.results = [wavelengths,intensities];
                    // Hey node runner, there are results !
                    callback();
                }
                
            },

            settings: {
                "lamp_id": {
                    type: "string",
                    value: "2469"
                }
            }
        }
    };
    
    function fetch_cie_data(callback){
        var columns = [
            "wavelength",
            "D65",
            "X_1964",
            "Y_1964",
            "Z_1964",
            "X_1931",
            "Y_1931",
            "Z_1931",
            "CIE_A",
            "S0",
            "S1",
            "S2"
        ]
        cie_data = [];
        
        // Prepare for separation of data in many small arrays
        for(var col in columns){
            cie_data[columns[col]] = [];
        }
        
        // Get the data through a GET http request
        ajax.get("data/d65-xyz.csv",function(data){
            // Parse it to a temporary variable
            var cie_data_objects = d3.csv.parse(data);
            // Format it in a nicer way
            // (Separate columns in small arrays)
            cie_data_objects.forEach(function(row){
                for(var col in columns){
                    var column = columns[col];
                    cie_data[column].push(parseFloat(row[column]));
                }
            });
            callback();
        })        
    }

    /*
      Find a lamp in the Lamp Spectral Power Distribution Database
     */
    function fetch_lspdd_lamp(lamp_id,callback){
        var url = lspdd_url.replace("#id#",lamp_id);
        // Get the data through a GET http request
        ajax.get(url,function(data){
            console.log(data);
            lspdd_lamps[lamp_id] = JSON.parse(data);
            // Hey we found the lamp!
            callback();
        })
        
    }

    
    function graph(node,res,settings){
        var xs = res[0] || [];
        var ys = res[1] || [];
        var wrapper = d3.select(node)
            .select(".chart svg");
        
        var min_x = d3.min(xs);
        var min_y = d3.min(ys);
        
        if(min_y > 0){
            min_y = 0;
        }
        
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
                // no height
                if(d[1] == 0){
                    return 0;
                }
                // goes above axis
                if(d[1] > 0){
                    return y_s(max_y - d[1]);
                }
                // goes below axis
                return y_s(d[1] + max_y);
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
