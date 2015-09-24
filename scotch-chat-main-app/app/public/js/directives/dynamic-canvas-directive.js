/**
 * Created by GalenWeber on 9/19/15.
 */
app.directive('dynamicCanvas', function () {

    function CanvasCtrl($scope) {


        var PIXEL_RATIO = (function () {
            var ctx = document.createElement("canvas").getContext("2d"),
                dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1;

            return dpr / bsr;
        })();


        createHiDPICanvas = function(w, h, ratio) {
            if (!ratio) { ratio = PIXEL_RATIO; }
            var can = document.createElement("canvas");
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";
            can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
            return can;
        };

        //Create canvas with the device resolution.

        var canvasWidth = 450;
        var canvasHeight = 500;
        var canvas = createHiDPICanvas(canvasWidth, canvasHeight);


        var context = canvas.getContext("2d"),
            img = document.createElement("img"),
            mouseDown = false,
            brushColor = "rgb(0, 0, 0)",
            hasText = true,
            clearCanvas = function () {
                if (hasText) {
                    context.clearRect(0, 0, canvasWidth, canvasHeight);
                    hasText = false;
                }
            };
        // Adding instructions
        context.fillText("Drop an image onto the canvas", canvasWidth/2, canvasHeight/2);
        context.fillText("Click a spot to set as brush color", canvasWidth/2, canvasHeight/2+20);

        // Image for loading
        img.addEventListener("load", function () {
            clearCanvas();
            context.drawImage(img, 0, 0);
        }, false);

        // To enable drag and drop
        canvas.addEventListener("dragover", function (evt) {
            evt.preventDefault();
        }, false);

        // Handle dropped image file - only Firefox and Google Chrome
        canvas.addEventListener("drop", function(e){
            e.preventDefault(); 
            console.log("dropped!", e.dataTransfer.files[0])
            loadImage(e.dataTransfer.files[0]);
            
        }, false);
        
        //load image
        function loadImage(src){
        //	Prevent any non-image file type from being read.
                if(!src.type.match(/image.*/)){
                    console.log("The dropped file is not an image: ", src.type);
                    return;
                }
            
                //	Create our FileReader and run the results through the render function.
                var reader = new FileReader();
                reader.onload = function(e){
                    console.log(e.target.result)
                    render(e.target.result);
                };
                reader.readAsDataURL(src);
            }
        
        // shrink image;
        var MAX_HEIGHT = 500;
        var render = function(src){
            img.src = src;
            var image = new Image();
            console.log("The height is ",src.height)
            image.onload = function(){
                var canvas = canvas;
                console.log(canvas)
                if(image.height > MAX_HEIGHT) {
                    image.width *= MAX_HEIGHT / image.height;
                    image.height = MAX_HEIGHT;
                }
                 var ctx = canvas.getContext();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0, image.width, image.height);
            };
          
        }
        //set colors
        $scope.colorPurple = "#cb3594";
        $scope.colorGreen = "#659b41";
        $scope.colorYellow = "#ffcf33";
        $scope.colorBrown = "#986928";
        var curColor = $scope.colorPurple;
        

        $scope.setColor= function(color){
            curColor = color;
        }
        //Initialize brush size
        var brushSize = 10;
        
        //Set Brush Size
        $scope.setBrush = function(num){
            brushSize = num;
        }
        // Detect mousedown
        canvas.addEventListener("mousedown", function (evt) {
            clearCanvas();
            mouseDown = true;
            context.beginPath();
        }, false);

        // Detect mouseup
        canvas.addEventListener("mouseup", function (evt) {
            mouseDown = false;
            // var colors = context.getImageData(evt.layerX, evt.layerY, 1, 1).data;
            var colors =curColor;
            brushColor = colors;
        }, false);

        // Draw, if mouse button is pressed
        canvas.addEventListener("mousemove", function (evt) {
            if (mouseDown) {
                context.strokeStyle = brushColor;
                context.lineWidth = brushSize;
                context.lineJoin = "round";
                context.lineTo(evt.layerX+1, evt.layerY+1);
                context.stroke();
            }
        }, false);
        
        // clear the canvas
       $scope.clearCanvas = function () {

			context.clearRect(0, 0, canvasWidth, canvasHeight);
		}


        var __slice = Array.prototype.slice;

        var parent = document.getElementById("canvas-container");
        console.log("parent is: ", parent);
        parent.appendChild(canvas);

    }

    return {
        restrict: 'E',
        scope: {},
        templateUrl: '../../html/canvas.html',
        controller: CanvasCtrl
    };
});
