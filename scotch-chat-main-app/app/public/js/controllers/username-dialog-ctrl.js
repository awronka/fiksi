//Dialog controller
function UsernameDialogController($scope, $mdDialog, SignUp, AuthService) {
    //show and hide the depending on the userStatus being new or returning
   $scope.newSession = true;
    

    
    $scope.newRoom = function(){
        $scope.newSession = true;
    }
    
    $scope.existingRoom = function(){
        $scope.newSession = false;
    }
    
   /*$scope.Login = function (answer) {

        $scope.error = null;

        AuthService.login(answer).then(function () {
            // $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };
    */
    
    
    $scope.answer = function (answer) {
        answer.newSession=$scope.newSession;
         SignUp.signup(answer).then(function(data){
             console.log("This is the data" + data);
         });
        $mdDialog.hide(answer);
    };
}


