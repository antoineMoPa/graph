function spectrum_node_types(root){
    var root = root;
    var cie_data = null;
    var lspdd_lamps = {};
    // Build proxy url
    var hostname = window.location.hostname;
    var protocol = window.location.protocol + "//";
    var lspdd_url = protocol
        + hostname +
        ":8001/lspdd?lamp_id=#ID#";

    var types = {
        "spectrum output": {
            inputs: ["wavelength","intensity"],
            info: "Spectrum",
            outputs: [],
            icon: "fa-bar-chart",
            oncreate: function(node,id){
                var node = root.node_for_id(id);
                var div = create_dom("div","");
                var content = SQSA(node,"content")[0];
                add_class(div,"chart");
                content.appendChild(div);
                // more width
                node.style.width = "600px";
                // hey, this is an output node!
                root.output_nodes.push(id);
            },
            onresult: function(nodes,id){
                var node = root.node_for_id(id);
                var self = nodes[id];
                var res = root.get_input_result(nodes,id);
                var chart_div = SQSA(node,".chart")[0];
                // create svg
                var chart = d3.select(chart_div)
                    .append("svg");
                
                spectrum_plot(node,res,self.settings);
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
            info: "Lamp Spectral Power Distribution Database",
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
                var lamp_id = self.settings['lamp_id'];
                // Find lamp data if it is not yet cached
                if(lspdd_lamps[lamp_id] == null){
                    // We send a callback
                    // executed after data is found
                    fetch_lspdd_lamp(lamp_id, calculate_lspdd_lamp);
                } else {
                    // Data is already cached in cie_data
                    // jump to function
                    calculate_lspdd_lamp();
                }
                function calculate_lspdd_lamp(){
                    var lamp = lspdd_lamps[lamp_id];
                    var spectrum_str = lamp["spectraldata"];
                    var spectrum = d3.csv
                        .parse(spectrum_str);
                    var wavelengths = [];
                    var intensities = [];

                    // Separate columns
                    // into 2 arrays
                    spectrum.map(function(d){
                        var w = parseFloat(
                            d.wavelength
                        )
                        var i = parseFloat(
                            d.relativeIntensity
                        );
                        // Is the value valid
                        if(!isNaN(i)){
                            wavelengths.push(w);
                            intensities.push(i);
                        } else {
                            // Some spectras have NaN
                            // values at the end
                            // Just stop when it happens
                            // d3.js will send less annoying warnings
                            return -1;
                        }
                    });
                    self.result = [wavelengths,intensities];
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
        var url = lspdd_url.replace("#ID#",lamp_id);
        // Get the data through a GET http request
        ajax.get(url,function(data){
            /* Empty string: fail */
            if(data == ""){
                console.error("Check if lspdd proxy is started.");
                return;
            }
            lspdd_lamps[lamp_id] = JSON.parse(data);
            // Hey we found the lamp!
            callback();
        })
        
    }

    /*
     
      Improvements:
      Approximate rgb color for wavelength
      Axis title
      Multi input spectrum
      Not calculate before 300 ms to avoid UI lock
      Temporary/loading image 
      
     */
    function spectrum_plot(node,res,settings){
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
        var margin_left = 100;
        var width = node.clientWidth - margin - margin_left;
        var height = 300 - 2 * margin;
        var bar_width = node.clientWidth / data.length;

        wrapper.selectAll("*").remove();
        
        chart = wrapper
            .attr("width", width + margin + margin_left)
            .attr("height", height + 2 * margin)
            .append("g")
            .attr("transform",
                  "translate("+margin_left+","+margin+")")
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
            .attr("fill","#3af")
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

        format_axis(x_axis_group);
        format_axis(y_axis_group);
        
        function format_axis(axis){
            axis
                .attr("fill","none")
                .attr("stroke","#000")
                .selectAll("text")
                .attr("font","10px sans-serif 300")
                .attr("stroke","none")
                .attr("fill","#000");
        }

        
        // replace svg by a canvas once rendered
        // (for performance increase + mem reduction)
        // SVG caused lags while dragging nodes
        // Remove current image
        var image = SQSA(node,"img")[0];
        if(image != undefined){
            image.parentNode.removeChild(image);
        }
        var svg = wrapper.node();
        // add image
        node.appendChild(svg_to_image(svg));
        // remove svg
        svg.parentNode.removeChild(svg);
    }

    /**
       Many thanks to this:
       https://gist.github.com/iwek/7121872
     */
    function svg_to_image(svg){
        var image = new Image();
        svg.setAttribute("version", 1.1);
        svg.setAttribute(
            "xmlns",
            "http://www.w3.org/2000/svg"
        );
        
        var html = svg.outerHTML;
        var src = 'data:image/svg+xml;base64,'+
            btoa(html);
        image.src = src;
        return image;
    }
    
    return types;
}
