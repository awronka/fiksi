app.factory("CanvasDraw", function(){
	    
                // We need to have the pixel density of the canvas reflect the pixel density of the users screen
        // PIXEL_RATIO is an automatically invoked function that returns the relevant ratio
        var PIXEL_RATIO = (function() {
            var ctx = document.createElement("canvas").getContext("2d"),
                dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

            return dpr / bsr;
        })();
        
        
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
        },
        pixelRatioCanvas: function(w, h, ratio) {
            if (!ratio) {
                ratio = PIXEL_RATIO;
            }
            var can = document.createElement("canvas");
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";
            can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
            return can;
        }, 
        renderCanvas: function(canvas, data, room, user, usersObject){
              if (data.room == room) {
                canvas.strokeStyle = data.color;
                canvas.lineWidth = data.brush;
                canvas.shadowBlur = 2;
                canvas.shadowColor = data.color;
                canvas.lineJoin = canvas.lineCap = "round";
                canvas.beginPath();
                if (usersObject[data.user]) {
                    user = usersObject[data.user];
                    user.xArray.push(data.x);
                    user.yArray.push(data.y);
                    if (user.xArray.length > 1) {
                        canvas.moveTo(user.xArray[user.xArray.length -2],user.yArray[user.yArray.length -2]);
                        canvas.lineTo(user.xArray[user.xArray.length-1],user.yArray[user.yArray.length-1]);
                        canvas.stroke();
                    }
                } else {
                    usersObject[data.user] = {xArray: [], yArray:[]};
                    user = usersObject[data.user];
                    user.xArray.push(data.x);
                    user.yArray.push(data.y);
                    canvas.stroke();
                }
            }
        },
        renderImage: function(context, data, canvasDim){
            if (!data) return;
            var image = new Image();
            image.src = data;
            image.onload = function() {

                context.drawImage(image, 0, 0, canvasDim, canvasDim);
            };
        }
        
	}
});