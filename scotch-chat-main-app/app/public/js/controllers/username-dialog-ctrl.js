//Dialog controller
function UsernameDialogController($scope, $mdDialog, SignUp, AuthService) {
    //show and hide the depending on the userStatus being new or returning
/*    $scope.userStatus = true;
    

    
    $scope.newUser = function(){
        $scope.userStatus = true;
            SignUp.getUsers().then(function(data){
                    console.log(data)
                })
    }
    
    $scope.returningUser = function(){
        $scope.userStatus = false;
    }
    
   $scope.Login = function (answer) {

        $scope.error = null;

        AuthService.login(answer).then(function () {
            // $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };
    */
    
    
    $scope.answer = function (answer) {
         SignUp.signup(answer).then(function(data){
             console.log("This is the data" + data);
         });
        $mdDialog.hide(answer);
    };
}


