'use strict';
//Load angular
var app = angular.module('scotch-chat', ['ngMaterial', 'ngAnimate', 'ngMdIcons', 'btford.socket-io'])
    //Set our server url
var serverBaseUrl = 'http://localhost:2015';


//Service to interact with the socket library
app.factory('socket', function (socketFactory) {
    var myIoSocket = io.connect(serverBaseUrl);

    var socket = socketFactory({
        ioSocket: myIoSocket
    });

    return socket;
});





//ng-enter directive
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

//Dialog controller
function UsernameDialogController($scope, $mdDialog, SignUp) {
    //show and hide the depending on the userStatus being new or returning
    $scope.userStatus = true;
    

    
    $scope.newUser = function(){
        $scope.userStatus = true;
            SignUp.getUsers().then(function(data){
                    console.log(data)
                })
    }
    
    $scope.returningUser = function(){
        $scope.userStatus = false;
    }
    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}


