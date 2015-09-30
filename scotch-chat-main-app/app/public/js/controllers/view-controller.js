app.controller('ViewCtrl', function($scope, $rootScope){
	$scope.captureVideo = false;
	$rootScope.$on("change to video", function(event, obj){
		$scope.captureVideo = obj.show;
	})
	$rootScope.$on("send video data", function(event, obj){
		$scope.captureVideo = obj.show;
	})
})