function web_node_types(g_root){
    var g_root = g_root;
    var server_url = "http://127.0.0.1:8000"
    var proxy_url = server_url + "/proxy?url=";

    var web_cache = {};
    
    var types = {
        "content from url": {
            inputs: [],
            outputs: ["content"],
            icon: "fa-cloud-download",
            info: "Results are cached until you reload the window.",
            settings: {
                url:{
                    type: "string",
                    value: "http://example.com",
                }
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                var url = ""+nodes[id].settings["url"];
                if(url != ""){
                    if(url.indexOf("http") == -1){
                        url = "http://" + url;
                    }

                    if(web_cache[url] != undefined){
                        self.result = [web_cache[url]];
                        callback();
                    } else {
                        ajax.get(proxy_url+url,function(d){
                            self.result = [d];
                            web_cache[url] = d;
                            callback();
                        });
                    }
                    
                    // tell bnr to wait until
                    // callback is called
                    return "wait";
                } else {
                    return "";
                }
            }
        },
        "JSON string to object": {
            inputs: ["string"],
            outputs: ["object"],
            icon: "fa-database",
            info: "JSON is a method of storing data as text.",
            settings: {
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                try{
                    var res = JSON.parse(inputs[0]);
                } catch(e){
                    g_root.happy_accident(id,"could not understand JSON");
                }
                self.result = [res];
            }
        },
        "Select ['part'] of object": {
            inputs: ["JSON object selector"],
            outputs: ["Sub object"],
            icon: "fa-spoon",
            info: "select a part of an object (From a JSON input, for example)",
            settings: {
                part:{
                    type: "string",
                    value: ""
                }
            },
            oncreate: function(node,id){
                g_root.output_nodes.push(id);
                var div = create_dom("div","");
                add_class(div,"json-el-list");
                SQSA(node,"content")[0].appendChild(div);
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                var inputs = g_root.get_input_result(nodes,id);
                var name = self.settings.part;
                if(inputs[0] == undefined){
                    var part = {};
                } else {
                    var part = deep_copy(inputs[0][name]);
                }
                self.result = [part];
            }
        }
    };
    
    return types;
}


