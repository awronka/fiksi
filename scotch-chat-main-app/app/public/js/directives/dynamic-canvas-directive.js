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
        var canvasHeight = 600;
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
        canvas.addEventListener("drop", function (evt) {
            var files = evt.dataTransfer.files;
            if (files.length > 0) {
                var file = files[0];
                if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                    var reader = new FileReader();
                    // Note: addEventListener doesn't work in Google Chrome for this event
                    reader.onload = function (evt) {
                        img.src = evt.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }
            evt.preventDefault();
        }, false);
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
            var colors =[255,0,255];
            brushColor = "rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")";
        }, false);

        // Draw, if mouse button is pressed
        canvas.addEventListener("mousemove", function (evt) {
            if (mouseDown) {
                context.strokeStyle = brushColor;
                context.lineWidth = 5;
                context.lineJoin = "round";
                context.lineTo(evt.layerX+1, evt.layerY+1);
                context.stroke();
            }
        }, false);

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
