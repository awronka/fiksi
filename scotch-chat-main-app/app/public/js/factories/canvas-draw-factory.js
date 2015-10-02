app.factory("CanvasDraw", function(){
	    
		//draw a dot
        function point(x, y, canvas){
        canvas.beginPath();
        canvas.arc(x, y, 1, 0, 2 * Math.PI, true);
        canvas.stroke();
        }
	
	return{
	    downDraw: function(brushColor, brushSize, x, y, canvas){
	        brushColor = brushColor;
            canvas.beginPath();
            canvas.lineWidth = brushSize;
            canvas.strokeStyle = brushColor;
            canvas.lineJoin = canvas.lineCap = "round";
            point(x, y, canvas)
		},
        moveDraw: function(brushColor, x, y, canvas){
                console.log(brushColor)
                canvas.lineTo(x + 1, y + 1);
                canvas.strokeStyle = brushColor;
                canvas.stroke();
                canvas.shadowBlur = 2;
                canvas.shadowColor = brushColor;   
        }
	}
})