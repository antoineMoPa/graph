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
    app.nodeWidth = q.d(".node").width()
    
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
    
    var fromNode = q.d(".node:nth-child(1)")
    var fromSocket = fromNode.find(".node-output:nth-child(1)")
    var fromX = fromSocket.left() + fromNode.left()
    var fromY = fromNode.top()+fromSocket.top() + 7
    
    var toNode = q.d(".node:nth-child(2)")
    var toSocket = toNode.find(".node-input:nth-child(1)")
    var toX = toNode.left()
    var toY = toNode.top()+toSocket.top() + 7
    
    fromSocket.addClass("output-selected")
    toSocket.addClass("input-selected")
    
    //Selected style
    // c.strokeStyle = "#FFC322"
    // c.lineWidth = 5
    // drawLine(100,100,toX,toY+20)
    
    c.strokeStyle = "#FFFFFF"
    c.lineWidth = 2
    
    drawLine(fromX,fromY,toX,toY)
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