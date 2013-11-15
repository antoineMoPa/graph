var app = {}

q.ready(function(){
    //Non-Glaph, project specific:    
    
    q.d(".menubar .button").on("click",function(){
        var id = q.d(this).attr("data-panel-id")
        var panel =  q.d("#"+id)
        var panelOpened = false

        if(panel.hasClass("menu-panel-displayed"))
            panelOpened = true
        
        q.d(".menu-panel-displayed")
            .removeClass("menu-panel-displayed")
        
        if(!panelOpened)
            panel.addClass("menu-panel-displayed")
    })
    
    //Glaph:

    app.glaph = q.d(".glaph")
    app.canvasElement = app.glaph.find("canvas").elements[0]
    app.canvas = app.canvasElement.getContext("2d")
    app.nodeWidth = q.d(".node").width()
    q.d(window).on("resize",setGlaphSize)
    setGlaphSize()     
    
    //Testing code
    var fromNode = q.d(".node:nth-child(1)")
    var toNode = q.d(".node:nth-child(2)")
    var fromSocket = fromNode.find(".node-output:nth-child(1)")
    var toSocket = toNode.find(".node-input:nth-child(1)")
    
    fromNode.top(100).left(200)
    toNode.top(120).left(500)

    q.d(".node").dragDrop({handle:".node-header",
                           onDrag:updateBoard})
    
    function updateBoard(){
        socketLink(fromSocket,toSocket)
    }
    
    q.d(".node-output, .node-input").on("mousedown",function(){
        var socket = q.d(this)
        var body = q.d("body")
        var isInput = socket.hasClass("node-input")              
        var sses =  isInput?                //Same Side Empty Sockets
                    q.d(".node-input"):
                    q.d(".node-output")    
        
        if(!socket.hasClass("input-selected") &&
           !socket.hasClass("output-selected"))
            return false

        socket.removeClass("input-selected")
        socket.removeClass("output-selected")

        body.on("mousemove",drag)
        app.glaph.addClass("moving-link-"+(isInput?"input":"output"))

        function drag(e){
            e.preventDefault()
            body.on("mouseup",bodyMouseUp)
            sses.on("mouseup",ssesMouseUp)
            
            if(isInput)
                socketLink(fromSocket,null,e.pageX,e.pageY)
            else
                socketLink(null,toSocket,e.pageX,e.pageY)
        }
        function unbindEvents(){
            body.unbind("mouseup",bodyMouseUp)
            sses.unbind("mouseup",ssesMouseUp)
            body.unbind("mousemove",drag)
            socketLink(fromSocket,toSocket)
        }
        function bodyMouseUp(){
            unbindEvents()
            app.glaph.removeClass("moving-link-input")
                     .removeClass("moving-link-output")
        }
        function ssesMouseUp(e){
            unbindEvents()
            if(isInput){
                toSocket = q.d(this)
                q.d(this).addClass("input-selected")
            }
            
            else{
                fromSocket = q.d(this)
                q.d(this).addClass("output-selected")
            }
            socketLink(fromSocket,toSocket)
        }
    })
})

function socketLink(fromSocket,toSocket,altX,altY){
    // If fromSocket or toSocket is null, altX and altY 
    // are used for positionning the corresponding end
    // of the wire.
    
    var c = app.canvas
    
    //Testing code
    clearCanvas()
    
    var fromNode,fromX,fromY
    
    var toNode,toX,toY
    
    if(fromSocket != null){
        fromNode = fromSocket.parent(2)
        fromX = fromSocket.left() + fromNode.left() + 15
        fromY = fromNode.top()+fromSocket.top() + 7
        fromSocket.addClass("output-selected")
    }
    else{
        fromX = altX
        fromY = altY
    }
    if(toSocket != null){
        toNode = toSocket.parent(2)
        toX = toNode.left() - 7
        toY = toNode.top()+toSocket.top() + 7
        toSocket.addClass("input-selected")
    }
    else{
        toX = altX
        toY = altY
    }
    
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