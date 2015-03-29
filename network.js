var ajax = {};

ajax.get = function(url){
    return ajax.request({
        url: url,
        method: "get"
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
        if(xhr.readyState == 0){
            if(typeof data.notInitialized === 'function'){
                data.notInitialized(xhr);
            }
        }
        if(xhr.readyState == 1){
            if(typeof data.setUp === 'function'){
                data.setUp(xhr);
            }
        }
        if(xhr.readyState == 2){
            if(typeof data.sent === 'function'){
                data.sent(xhr);
            }
        }
        if(xhr.readyState == 3){
            if(typeof data.inProgress === 'function'){
                data.inProgress(xhr);
            }
        }
        if(xhr.readyState == 4){
            console.log(xhr.responseText)
            if(typeof data.complete === 'function'){
                data.complete(xhr);
            }
        }
    }
    xhr.send();
}
