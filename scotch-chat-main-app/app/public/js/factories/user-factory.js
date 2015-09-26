app.factory('SignUp', function ($http) {

	var serverBaseUrl = 'http://localhost:2015';
	// var serverBaseUrl = 'https://frozen-sea-6880.herokuapp.com';

	return{
		signup: function (credentials) {
		return $http.post(serverBaseUrl+'/user', credentials).then(function (res) {
			console.log(res.data)
			return res.data;
		});
		},

        getUsers: function(){
            return $http.get(serverBaseUrl + '/user').then(function(response){
                return response.data;
            })
        },
		update: function (credentials) {
		return $http.put('/user/update/', credentials).then(function (res) {
			console.log(res.data);
			return res.data;
		});
		},
		pass: function (credentials) {
		return $http.put('/user/newpassword', credentials).then(function (res) {
			console.log(res.data);
			return res.data;
		});
		},
		deleteUser: function(creds){
			return $http.delete('/user/'+ creds).then(function(res){
				console.log("this user is gone" + res.data)
				return res.data;
			})
		}
	}
});