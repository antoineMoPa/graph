var app = {}

q.d.fn.dragDrop = function(dragOver) {    
    dragOver = dragOver || function(){}
    this.each(function(){
        var body = q.d("body")
        this.on("mousedown",function(){
            body.on("mousemove",drag)

        })
        function drag(){
            console.log("dragging")
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
    
    q.d(".node").dragDrop()

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