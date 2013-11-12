var app = {}

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

q.ready(function(){
    app.glaph = q.d(".glaph")
    app.canvasElement = app.glaph.find("canvas").elements[0]
    app.canvas = app.canvasElement.getContext("2d")
    app.nodeWidth = q.d(".node").width()
    q.d(window).on("resize",setGlaphSize)
    setGlaphSize()
    
    //Testing code
  
    q.d(".node:nth-child(1)").top(100).left(200)
    q.d(".node:nth-child(2)").top(120).left(500)

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
    var fromX = fromSocket.left() + fromNode.left() + 15
    var fromY = fromNode.top()+fromSocket.top() + 7
    
    var toNode = q.d(".node:nth-child(2)")
    var toSocket = toNode.find(".node-input:nth-child(1)")
    var toX = toNode.left() - 7
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
    if(x < toX)
        c.bezierCurveTo(x+(toX-x)/2,y,toX-(toX-x)/2,toY,toX,toY)
    else
        c.bezierCurveTo(-(toX-x)+x,1/4*(toY-y)+y,toX-(x-toX),3/4*(toY-y)+y,toX,toY)
    c.stroke()
    c.fill()
    c.fillStyle = "rgba(0,0,0,1)";
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