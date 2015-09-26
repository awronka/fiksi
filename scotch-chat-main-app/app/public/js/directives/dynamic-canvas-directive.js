/**
 * Created by GalenWeber on 9/19/15.
 * Edited Brilliantly by AlexiusWronka on 9/24/15
 */
app.directive('dynamicCanvas', function ($rootScope, UndoRedo) {

    function CanvasLink($scope, element, attrs) {
        
        console.log('link f');


        // We need to have the pixel density of the canvas reflect the pixel density of the users screen
        // PIXEL_RATIO is an automatically invoked function that returns the relevant ratio
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



        var createHiDPICanvas = function(w, h, ratio) {
            if (!ratio) { ratio = PIXEL_RATIO; }
            var can = document.createElement("canvas");
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";
            can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
            return can;
        };


        // Here we set the width and height of the canvas, then create one with our function
        var canvasWidth = 450;
        var canvasHeight = 250;
        var canvas = createHiDPICanvas(canvasWidth, canvasHeight);


        var context = canvas.getContext("2d");
        var mouseDown = false;
        var hasText = true;
        var brushColor = "rgb(0, 0, 0)";
        var image = document.createElement("img");

        var clearCanvas = function () {
                context.clearRect(0, 0, canvasWidth, canvasHeight);
        };

        // Adding instructions
        context.fillText("Drop an image onto the canvas", canvasWidth/2, canvasHeight/2);
        context.fillText("Click a spot to set as brush color", canvasWidth/2, canvasHeight/2+20);



        // To enable drag and drop
        canvas.addEventListener("dragover", function (evt) {
            evt.preventDefault();
        }, false);

        // Handle dropped image file - only Firefox and Google Chrome
        canvas.addEventListener("drop", function(e){
            clearCanvas();
            hasText = false;
            e.preventDefault(); 
            console.log("dropped!", e.dataTransfer.files[0])
            loadImage(e.dataTransfer.files[0]);
            
        }, false);
        
        //load image
        function loadImage(src){
        //	Prevent any non-image file type from being read.
            console.log("in the load image function");
            if(!src.type.match(/image.*/)){
                console.log("The dropped file is not an image: ", src.type);
                return;
            }

            //	Create our FileReader and run the results through the render function.
            var reader = new FileReader();
            reader.onload = function(e){
                img.src = e.target.result;
            };
            reader.readAsDataURL(src);


            var img = document.createElement("img");

            // Image for loading
            img.addEventListener("load", function () {
                console.log("in the img on load function");
                //clearCanvas();
                if(img.height > canvasHeight) {
                    img.width *= canvasHeight / img.height;
                    img.height = canvasHeight;
                }
                context.drawImage(img, 0, 0, img.width, img.height);
            }, false);
        }

        //set colors
        $scope.colorPurple = "#cb3594";
        $scope.colorGreen = "#659b41";
        $scope.colorYellow = "#ffcf33";
        $scope.colorBrown = "#986928";
        var curColor = $scope.colorPurple;
        

        $scope.setColor= function(color){
            curColor = color;
        };
        //Initialize brush size
        var brushSize = 10;
        
        //Set Brush Size
        $scope.setBrush = function(num){
            brushSize = num;
        };
        // Detect mousedown
        canvas.addEventListener("mousedown", function (evt) {
            if (hasText) {
                clearCanvas();
                hasText = false;
            }
            mouseDown = true;
           var colors =curColor;
            brushColor = colors;
            context.beginPath();
        }, false);

        // Detect mouseup
        canvas.addEventListener("mouseup", function (evt) {
            mouseDown = false;
            var imageToUndo = canvas.toDataURL();
            // send image for undo/redo
            UndoRedo.saveImageState(imageToUndo);
            // var colors = context.getImageData(evt.layerX, evt.layerY, 1, 1).data;
        }, false);

        // Draw, if mouse button is pressed
        canvas.addEventListener("mousemove", function (evt) {
            if (mouseDown) {
                context.strokeStyle = brushColor;
                context.lineWidth = brushSize;
                context.lineJoin = "round";
                context.lineTo(evt.layerX+1, evt.layerY+1);
                context.stroke();
                imageForEmit = canvas.toDataURL();
                $rootScope.$broadcast('imageToSocket', {imageForEmit:imageForEmit});
            }
        }, false);
        
        //Undo changes to Canvas
        $scope.undoChanges = function(){
            var data = UndoRedo.undo();
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            var image = new Image();
            image.src = data;

            image.onload = function(){
               
                context.drawImage(image, 0,0, 450, 200);
            };
            
        }
        
        // clear the canvas
       $scope.clearCanvas = function () {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
		}
        
        //turn image data to 64bit encoded
        var imageForEmit = canvas.toDataURL();
        
        // send the image from the canvas to all users in chat
        $scope.sendImage = function(){
            // console.log("stage 1", imageForEmit)
            imageForEmit = canvas.toDataURL();

            $rootScope.$broadcast('imageToChat', {imageForEmit: imageForEmit});
        }

        var __slice = Array.prototype.slice;

        var parent = document.getElementById("canvas-container");
        console.log("parent is: ", parent);
        canvas.setAttribute('id', 'main-canvas');
        parent.appendChild(canvas);

    }

    return {
        restrict: 'E',
        scope: {},
        templateUrl: '../../html/canvas.html',
        link: CanvasLink
    };
});
