function web_node_types(root){
    var root = root;
    var updater_interval = null;
    var updater_time_interval = 0;
    var server_url = "http://127.0.0.1:8000"
    var proxy_url = server_url + "/proxy?url=";
    
    var types = {
        "content from url": {
            inputs: [],
            outputs: ["content"],
            icon: "fa-cloud-download",
            settings: {
                url:{
                    type: "string",
                    value: 0,
                }
            },
            calculate: function(nodes,id,callback){
                var self = nodes[id];
                var url = nodes[id].settings["url"];

                if(url.indexOf("http") == -1){
                    url = "http://" + url;
                }
                
                ajax.get(proxy_url+url,function(d){
                    self.result = [d];
                    callback();
                });
                
                // tell bnr to wait until
                // callback is called
                return "wait";
            }
        },
    };
    
    return types;
}


