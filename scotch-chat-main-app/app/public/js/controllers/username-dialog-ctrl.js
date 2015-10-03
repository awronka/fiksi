//Dialog controller
function UsernameDialogController($scope, $mdDialog, AuthService) {
    //show and hide the depending on the userStatus being new or returning
   $scope.newSession = true;
    

    
    $scope.newRoom = function(){
        $scope.newSession = false;
    }
    
    $scope.existingRoom = function(){
        $scope.newSession = true;
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
        console.log("anything");
        answer.newSession=$scope.newSession;
        $mdDialog.hide(answer);
    };
}


