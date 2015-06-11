var ajax = {};

ajax.get = function(url,callback){
    ajax.request({
        url: url,
        method: "get",
        complete: callback
    });
}

ajax.json = function(url, callback){
    
}

/*
  ex:
  ajax.post(
      "http://127.0.0.1:8000",
      {dude:3},
      function(response){
          console.log(response);
      }
  );

*/
ajax.post = function(url,data,callback){
    ajax.request({
        url: url,
        method: "post",
        data: data,
        complete: callback
    });
}

ajax.request = function(data){
    if(typeof data.url === 'undefined'){
        return "AJAX: url is undefined";
    }
    if(typeof data.method === 'undefined'){
        return "AJAX: method is undefined";
    }
    
    var xhr = new XMLHttpRequest();
    
    xhr.open(data.method,data.url,true);
    
    xhr.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
    );
    
    if(data.beforeSend === 'function'){
        data.beforeSend(xhr);
    }
    
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(typeof data.complete === 'function'){
                data.complete(xhr.response);
            }
        }
    }
    if(data.data != undefined){
        xhr.send(data.data);
    } else {
        xhr.send();
    }
}

ajax.load_stylesheets = function(urls){    
    for(var i = 0; i < urls.length; i++){
        // create a <link> element and add it to head
        var link = document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("href",urls[i]);
        document.head.appendChild(link);
    }
};

ajax.load_scripts = function(urls,callback){
    // Keep track of loaded scripts
    // When everything is loaded, we call the callback
    var loaded = 0;
    function new_loaded(){
        loaded++;
        if(loaded == urls.length){
            callback();
        }
    }
    
    for(var i = 0; i < urls.length; i++){
        // create a <script> element and add it to head
        var script = document.createElement("script");
        script.setAttribute("type","text/javascript");
        script.setAttribute("src",urls[i]);
        script.onload = new_loaded;
        document.head.appendChild(script);
    }
};
