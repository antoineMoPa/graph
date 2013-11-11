var app = {}

q.d.fn.dragDrop = function(settings) {    
        
    var settings = q.extend(settings,{
        handle: "this",
        dragOver: function(){},
        onDrag: function(){}
    })
    
    this.each(function(){
        var body = q.d("body")
        var el = this

        var initialX = 0
        var initialY = 0
        var handle = settings.handle == "this" ? el:el.find(settings.handle) 
        
        handle.on("mousedown",function(e){
            initialX = e.pageX - el.left()
            initialY = e.pageY - el.top()
            body.on("mousemove",drag)
        })
        function drag(e){
            el.top(e.pageY - initialY)
            el.left(e.pageX - initialX)
            body.on("mouseup",mouseUp)
            settings.onDrag()
        }
        function mouseUp(){
            body.unbind("mouseup",mouseUp)
            body.unbind("mousemove",drag)
            settings.dragOver()
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
    
    q.d(".node").dragDrop({handle:".node-header",
                           onDrag:drawLines})

    drawLines()
})

function drawLines(){
    var c = app.canvas
    
    //Testing code
    clearCanvas()
    var toX = q.d(".node").left()
    var toY = q.d(".node").top()
    
    // c.strokeStyle = "#FFC322"
    // c.lineWidth = 5
    // drawLine(100,100,toX,toY+20)
    
    c.strokeStyle = "#FFFFFF"
    c.lineWidth = 2
    drawLine(100,100,toX,toY+47)
}

function drawLine(x,y,toX,toY){
    var c = app.canvas
    c.fillStyle = "rgba(0,0,0,0)"
    c.beginPath()
    c.moveTo(x,y)
    c.bezierCurveTo((toX-x)/2+x,y,(toX-x)/2+x,toY,toX,toY)
    c.stroke()
    c.fill()
}

function clearCanvas(){
    var c = app.canvas
    c.fillStyle = "#aaa"
    c.fillRect(0,0,app.width,app.height)
}

function setGlaphSize(){
    app.height = q.d(".glaph").height()
    app.width = q.d(".glaph").width()
    app.canvasElement.width = app.width
    app.canvasElement.height = app.height
    clearCanvas()
}