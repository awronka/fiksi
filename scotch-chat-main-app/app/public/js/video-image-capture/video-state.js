app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/video-image-capture/video.html',
        controller: 'VideoCtrl'
    });
});


