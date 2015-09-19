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


