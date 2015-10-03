/**
 * Created by GalenWeber on 9/19/15.
 * Edited Brilliantly by AlexiusWronka on 9/24/15
 */

app.directive('dynamicCanvas', function($rootScope, UndoRedo, CanvasDraw, socket) {

    var usersObject = {};

    function CanvasLink($scope) {

        var createHiDPICanvas = CanvasDraw.pixelRatioCanvas;

        // Here we set the width and height of the canvas, then create one with our function
        var canvasDim = 500;
        var canvas = createHiDPICanvas(canvasDim, canvasDim);


        var context = canvas.getContext("2d");
        var mouseDown = false;
        var hasText = true;

        var clearCanvas = function() {
            context.clearRect(0, 0, canvasDim, canvasDim);
        };

        // Adding instructions
        context.fillText("Drop an image onto the canvas", canvasDim / 2, canvasDim / 2);
        context.fillText("Click a spot to set as brush color", canvasDim / 2, canvasDim / 2 + 20);



        // To enable drag and drop
        canvas.addEventListener("dragover", function(evt) {
            evt.preventDefault();
        }, false);

        // Handle dropped image file - only Firefox and Google Chrome
        canvas.addEventListener("drop", function(e) {
            clearCanvas();
            hasText = false;
            e.preventDefault();
            console.log("dropped!", e.dataTransfer.files[0])
            loadImage(e.dataTransfer.files[0]);

        }, false);

        //load image
        function loadImage(src) {
            //  Prevent any non-image file type from being read.
            console.log("in the load image function");
            if (!src.type.match(/image.*/)) {
                console.log("The dropped file is not an image: ", src.type);
                return;
            }

            //  Create our FileReader and run the results through the render function.
            var reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(src);


            var img = document.createElement("img");

            // Image for loading
            img.addEventListener("load", function() {
                console.log("in the img on load function");
                //clearCanvas();
                if (img.height > canvasDim) {
                    img.width *= canvasDim / img.height;
                    img.height = canvasDim;
                }
                context.drawImage(img, 0, 0, img.width, img.height);
                imageForEmit = canvas.toDataURL();
                $rootScope.$broadcast('imageToSocket', {
                    imageForEmit: imageForEmit
                });
                socket.emit('newImage',{ image: true, buffer: imageForEmit.toString('base64') });
            }, false);
        }

        socket.on('drawImage', function(data){
            CanvasDraw.renderImage(context, data, canvasDim);
        });

        //set colors
        $scope.colorRed =    "#FF0000";
        $scope.colorOrange = "#FF8D00";
        $scope.colorYellow = "#FFFF00";
        $scope.colorGreen =  "#008000";
        $scope.colorBlue =   "#0000FF";
        $scope.colorPurple = "#800080";
        $scope.colorBlack =  "#000000";
        //$scope.colorBrown =  "#986928";

        var curColor = $scope.colorRed;


        $scope.setColor = function(color) {
            curColor = color;
        };
        //Initialize brush size
        var brushSize = 10;

        //Set Brush Size
        $scope.setBrush = function(num) {
            brushSize = num;
        };
        
        // Detect mousedown
        canvas.addEventListener("mousedown", function(evt) {
            if (hasText) {
                clearCanvas();
                hasText = false;
            }
            mouseDown = true;
        }, false);


        // Detect mouseup
        canvas.addEventListener("mouseup", function(evt) {
            mouseDown = false;
            var imageToUndo = canvas.toDataURL();
            // send image for undo/redo
            UndoRedo.saveImageState(imageToUndo);
            // var colors = context.getImageData(evt.layerX, evt.layerY, 1, 1).data;
            socket.emit('mouseUp',{user:$rootScope.username});
        }, false);

        // Draw, if mouse button is pressed
        canvas.addEventListener("mousemove", function(evt) {
            if (mouseDown) {                               
                //CanvasDraw.moveDraw(curColor, evt.layerX, evt.layerY, context);
                //$rootScope.$broadcast('coordinateToSocket', {
                //    x: (evt.layerX + 1),
                //    y: (evt.layerY + 1),
                //    color: curColor,
                //    brush: brushSize
                //});

                socket.emit('draw',{
                    room: $rootScope.room,
                    x: (evt.layerX + 1),
                    y: (evt.layerY + 1),
                    color: curColor,
                    brush: brushSize,
                    user:$rootScope.username
                });
            }
        }, false);

        socket.on('triggerMouseUp', function(data) {
            if (usersObject[data.user]) {
                usersObject[data.user] = {xArray: [], yArray:[]};
            }
        });


        var user;
        socket.on('drawLine', function(data) {
            CanvasDraw.renderCanvas(context, data, $rootScope.room, user, usersObject);
        });

        socket.on('roomRequest', function(data) {
            if (data.room == $rootScope.room) {
                imageForEmit = canvas.toDataURL();
                socket.emit('roomImage',{ image: true, buffer: imageForEmit.toString('base64') });
            }
        });

        socket.on('sentRoomImage', function(data) {
            CanvasDraw.renderImage(context, data.buffer, canvasDim);
        });

        socket.on('canvasUpdate', function(data) {
               CanvasDraw.renderImage(context, data, canvasDim);
        });

        //Undo changes to Canvas
        $scope.undoChanges = function() {
            var data = UndoRedo.undo();
            if (!data) return;
            context.clearRect(0, 0, canvasDim, canvasDim);

            var image = new Image();
            image.src = data;

            image.onload = function() {

                context.drawImage(image, 0, 0, canvasDim, canvasDim);
            };

        };

        // redoChanges
        $scope.redoChanges = function() {
            var data = UndoRedo.redo();
            if (!data) return;
            context.clearRect(0, 0, canvasDim, canvasDim);

            var image = new Image();
            image.src = data;

            image.onload = function() {

                context.drawImage(image, 0, 0, canvasDim, canvasDim);
            };
        };

        // clear the canvas
        $scope.clearCanvas = function() {
            context.clearRect(0, 0, canvasDim, canvasDim);
            $rootScope.$broadcast('clearCanvas', {});
        };

        //turn image data to 64bit encoded
        var imageForEmit = canvas.toDataURL();

        // send the image from the canvas to all users in chat
        $scope.sendImage = function() {
            // console.log("stage 1", imageForEmit)
            imageForEmit = canvas.toDataURL();

            $rootScope.$broadcast('imageToChat', {
                imageForEmit: imageForEmit
            });
        };

        //update canvas
        $scope.$on("update canvas", function(event, imgData) {
            var data = imgData.data.buffer.buffer;
            if (!data) return;
            // context.clearRect(0, 0, canvasDim, canvasDim);
            var image = new Image();
            image.src = data;

            image.onload = function() {

                context.drawImage(image, 0, 0, canvasDim, canvasDim);
            };
        });
        
        //switch to video
        // $scope.switchToVideo = function(){
        //     console.log('clear')
        //     $rootScope.$broadcast("change to video", {show: true})
        // };
        
        // //get video image
        // $rootScope.$on("send video data", function(event, imgData) {
        //     console.log("This is the image data: ", imgData)
        //     var data = imgData.videoImage;
            
        //     if (!data) return;
        //     // context.clearRect(0, 0, canvasDim, canvasDim);
        //     var image = new Image();
        //     image.src = data;

        //     image.onload = function() {

        //         context.drawImage(image, 0, 0, canvasDim, canvasDim);
        //     };
        // });

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
