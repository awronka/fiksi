app.factory("ChatRoomRoute", function($http){
	return {
		getRoom: function(room){
			return $http.get(room).success(function (msgs) {
					return msgs;
					});
		}
		
	}
})

