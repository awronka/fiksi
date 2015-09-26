//Our Contrller 
app.controller('MainCtrl', function ( $scope, Window, AuthService, GUI, $mdDialog, SignUp, socket, $http, $rootScope) {
    //Global Scope
    $scope.messages = [];
    $scope.room = "";

    //Build the window menu for our app using the GUI and Window service
    var windowMenu = new GUI.Menu({
        type: 'menubar'
    });
    var roomsMenu = new GUI.Menu();

    windowMenu.append(new GUI.MenuItem({
        label: 'Rooms',
        submenu: roomsMenu
    }));

    windowMenu.append(new GUI.MenuItem({
        label: 'Exit',
        click: function () {
            Window.close()
        }
    }));


    //Listen for the setup event and create rooms
    socket.on('setup', function (data) {
        var rooms = data.rooms;

        for (var r = 0; r < rooms.length; r++) {
            //Loop and append room to the window room menu
            handleRoomSubMenu(r);
        }
        
    //Listens for a new image to be sent
    socket.on('new user image', function(image){
        document.body.appendChild(img);
        
    });
    

        //Handle creation of room
        function handleRoomSubMenu(r) {
                var clickedRoom = rooms[r];
                //Append each room to the menu
                roomsMenu.append(new GUI.MenuItem({
                    label: clickedRoom,
                    click: function () {
                        //What happens on clicking the rooms? Swtich room.
                        $scope.room = clickedRoom;
                        //Notify the server that the user changed his room
                        socket.emit('switch room', {
                            newRoom: clickedRoom,
                            username: $scope.username
                        });
                        //Fetch the new rooms messages
                        $http.get(serverBaseUrl + '/msg?room=' + clickedRoom).success(function (msgs) {
                            $scope.messages = msgs;
                        });
                    }
                }));
            }
            //Attach menu
        windowMenu.createMacBuiltin('Fiksi',{
            hideWindow: true
        });
        GUI.Window.get().menu = windowMenu;
    });


    $scope.usernameModal = function (ev) {
        //Launch Modal to get username
        $mdDialog.show({
                controller: UsernameDialogController,
                templateUrl: 'html/username.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev
            })
            .then(function (answer) {
                //Set username with the value returned from the modal
                $scope.username = answer.displayName;
                //Tell the server there is a new user
                socket.emit('new user', {
                    username: answer.displayName
                });
                //Set room to general;
                $scope.room = answer.displayName+'*'+answer.chatRoom.split(' ').join('-');
                

                socket.emit('createRoom',{
                    newRoom:$scope.room
                });

                //Fetch chat messages in room
                $http.get(serverBaseUrl + '/msg?room=' + $scope.room).success(function (msgs) {
                    $scope.messages = msgs;
                });
            }, function () {

            });
    };
    
    // catch and send new image to the server
    $rootScope.$on('imageToSocket', function(event, imgData){
       // console.log("stage 2", imgData.imageForEmit) 
       var img = imgData.imageForEmit;
       socket.emit('new image', { image: true, buffer: img.toString('base64') })
    });

    // catch a new coordinate and send to server
    $rootScope.$on('coordinateToSocket', function(event, coordinates){
        socket.emit('new coordinates', coordinates)
    });

    // catch a new coordinate and send to server
    $rootScope.$on('newLine', function(event, obj){
        socket.emit('newLine', obj)
    });

    // catch a clear and send to server
    $rootScope.$on('clearCanvas', function(event, obj){
        socket.emit('clearCanvas', obj)
    });

    // catch and send new image to server to display in chat
    $rootScope.$on('imageToChat', function(event, imgData) {
        var img = imgData.imageForEmit;
        //console.log(imgData);
        $scope.messages.push(imgData);
        socket.emit('new chat image', { 
            image: true, 
            buffer: img.toString('base64'),
            room: $scope.room,
            message: "",
            imageData: img,
            username: $scope.username });
    });

 
    //Listen for new images
    socket.on('image created', function(data){
        // console.log("stage 4", data.buffer.buffer)
        $rootScope.$broadcast("update canvas", {data:data});
        //mini canvas test
        // var ctx = document.getElementById('test-canvas').getContext('2d');
        var img = new Image();
        img.src = data.buffer.buffer;
        img.id = "sharedImage";
        //should test if the box is working
        var imgFrame = document.getElementById("img-test-div");   // Get the <ul> element with id="myList"
        if (imgFrame.hasChildNodes()) {
        // It has at least one
        imgFrame.removeChild(imgFrame.lastChild);
        }
        imgFrame.appendChild(img);
        createCanvas();
        // ctx.drawImage(img, 450, 250);

    });

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
    var context = null;

    var createCanvas = function() {
        var canvas = createHiDPICanvas(canvasWidth, canvasHeight);
        canvas.id = 'overlay-canvas';
        canvas.setAttribute('class','coveringCanvas');
        var imgFrame = document.getElementById("img-test-div");
        imgFrame.appendChild(canvas);
        context = canvas.getContext("2d");
        context.strokeStyle = "#cb3594";
        context.lineWidth = 10;
        context.lineJoin = "round";
    };

    createCanvas();




    //Listen for coordinates
    socket.on('coordinates created', function(data){
        context.strokeStyle = data.color;
        context.lineTo(data.x+1, data.y+1);
        context.stroke();
        $rootScope.$broadcast('new coordinate', data)
    });

    socket.on('newLine', function(data) {
        context.beginPath();
    });

    socket.on('clearCanvas', function(data) {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        var img = document.getElementById("sharedImage");
        img.remove(img.selectedIndex);
    });




    //Listen for chat images
    socket.on('chat image created', function(data) {
        console.log('image received');
        $scope.messages.push(data);

        var notification = new Notification("New image from " + data.username);        

        notification.onshow = function () {
            
            // auto close after 2 second
            setTimeout(function () {
                notification.close();
            }, 2000);
        }
    });

    
    //Listen for new messages
    socket.on('message created', function (data) {
        console.log('listened');
        //Push to new message to our $scope.messages
        $scope.messages.push(data);
        //Empty the textarea
        $scope.message = "";

        var options = {
            body: data.content
        };

        var notification = new Notification("Message from: "+data.username, options);        

        notification.onshow = function () {
            
            // auto close after 1 second
            setTimeout(function () {
                notification.close();
            }, 2000);
        }

    });
    socket.on('stellatest',function(data){
        console.log(data);
    });
    //Send a new message
    $scope.send = function (msg) {
        //Notify the server that there is a new message with the message as packet
        socket.emit('new message', {
            room: $scope.room,
            message: msg,
            username: $scope.username
        });

    }
});
