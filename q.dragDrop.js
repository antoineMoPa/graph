;(function(q){
q.d.fn.dragDrop = function(settings) {    
    var $ = this
    
    var settings = q.extend(settings,{
        handle: "this",
        dragStart:function(){},
        dragEnd: function(){},
        onDrag: function(){}
    })
    
    $.each(function(){
        var body = q.d("body")
        var el = q.d($.element)

        var initialX = 0
        var initialY = 0
        var handle = settings.handle == "this" ? el:el.find(settings.handle) 
        
        handle.on("mousedown",function(e){
            initialX = e.pageX - el.left()
            initialY = e.pageY - el.top()
            settings.dragStart()
            body.on("mousemove",drag)
        })

        function drag(e){
            e.preventDefault()
            el.top(e.pageY - initialY)
            el.left(e.pageX - initialX)
            body.on("mouseup",mouseUp)
            settings.onDrag()
        }
        function mouseUp(){
            body.unbind("mouseup",mouseUp)
            body.unbind("mousemove",drag)
            settings.dragEnd()
        }
    })
    return this
}
})(shortcutLib)