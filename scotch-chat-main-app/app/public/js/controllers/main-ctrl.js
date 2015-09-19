//Our Contrller 
app.controller('MainCtrl', function ($scope, Window, GUI, $mdDialog, SignUp, socket, $http) {
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

        //Handle creation of room
        function handleRoomSubMenu(r) {
                var clickedRoom = rooms[r];
                //Append each room to the menu
                roomsMenu.append(new GUI.MenuItem({
                    label: clickedRoom.toUpperCase(),
                    click: function () {
                        //What happens on clicking the rooms? Swtich room.
                        $scope.room = clickedRoom.toUpperCase();
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
        GUI.Window.get().menu = windowMenu;
    });


    $scope.usernameModal = function (ev) {
        //Launch Modal to get username
        $mdDialog.show({
                controller: UsernameDialogController,
                templateUrl: 'partials/username.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            })
            .then(function (answer) {
 
                //Set username with the value returned from the modal
                $scope.username = answer;
                //Tell the server there is a new user
                socket.emit('new user', {
                    username: answer
                });
                //Set room to general;
                $scope.room = 'GENERAL';
                
                //set up to get user from the server
                // $http.get(serverBaseUrl + '/user').then(function(user){
                //    console.log(user.data)
                //    return user
                // });

                
                
                //Fetch chat messages in GENERAL
                $http.get(serverBaseUrl + '/msg?room=' + $scope.room).success(function (msgs) {
                    $scope.messages = msgs;
                });
            }, function () {

            });
    };
    //Listen for new messages
    socket.on('message created', function (data) {
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
    //Send a new message
    $scope.send = function (msg) {
        //Notify the server that there is a new message with the message as packet
        socket.emit('new message', {
            room: $scope.room,
            message: msg,
            username: $scope.username
        });

    };
});
