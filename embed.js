(function(){
    var script = document.createElement("script");
    var this_script = document
        .querySelectorAll("script[name='graph-embed']")[0];
    var base_path = this_script.src.replace("embed.js","");

    // main.js will use this path
    // to load other assets
    window.GRAPH_BASE_PATH = base_path;
    script.setAttribute("type","text/javascript");
    script.setAttribute("src",base_path + "main.js");
    document.head.appendChild(script);
})();
