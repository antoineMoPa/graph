var app = {}

q.d.fn.dragDrop = function(settings) {    
        
    var settings = q.extend(settings,{
        handle: "this",
        dragOver: function(){}
    })
    
    this.each(function(){
        var body = q.d("body")
        var el = this

        var initialX = 0
        var initialY = 0
        //var handle = settings.handle == "this" ? el:el.find(settings.handle) 
        //console.log(el)
        handle = el.find(settings.handle)
        console.log(handle)
        handle.on("mousedown",function(e){
            initialX = e.pageX - el.left()
            initialY = e.pageY - el.top()
            body.on("mousemove",drag)
        })
        function drag(e){
            el.top(e.pageY - initialY)
            el.left(e.pageX - initialX)
            body.on("mouseup",mouseUp)
        }
        function mouseUp(){
            body.unbind("mouseup",mouseUp)
            body.unbind("mousemove",drag)
        }
    })
    return this
}

q.ready(function(){
    app.glaph = q.d(".glaph")
    app.canvasElement = app.glaph.find("canvas").elements[0]
    app.canvas = app.canvasElement.getContext("2d")
    
    q.d(window).on("resize",setGlaphSize)
    setGlaphSize()

    
    //Testing code
    
    q.d(".node").dragDrop({handle:".node-header"})

    var c = app.canvas
    c.fillStyle = "#aaa"
    c.fillRect(0,0,app.width,app.height)
    
    drawLines()
})



function drawLines(){
    var c = app.canvas
    
    c.strokeStyle = "#000"
    c.lineWidth = 1
    drawLine(0,0,100,100)
}

function drawLine(x,y,toX,toY){
    var c = app.canvas
    c.beginPath()
    c.moveTo(x,y)
    c.lineTo(toX,toY)
    c.stroke()
    c.fill()
}

function setGlaphSize(){
    app.height = q.d(".glaph").height()
    app.width = q.d(".glaph").width()

    app.canvasElement.width = app.width
    app.canvasElement.height = app.height
    
}