var ajax = {};

ajax.get = function(url,callback){
    ajax.request({
        url: url,
        method: "get",
        complete: callback
    });
}

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
