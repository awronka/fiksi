app.directive('videoCapture', function($rootScope, UndoRedo) {
    
    function VideoCtrl($scope){
    //     var photoButton = document.createElement('button');
    // var saveButton = document.createElement('button');
    // saveButton.innerText = 'Save Image';
    // saveButton.addEventListener('click', savePhoto, true);
    // photoButton.innerText = 'Take Screenshot';
    // photoButton.addEventListener('click', takePhoto, true);
    // document.body.appendChild(photoButton);
    // document.body.appendChild(saveButton);


    var gui = require('nw.gui');

    console.log(gui);


    
    gui.Screen.Init();

    var video = document.querySelector('video');
    var canvas = document.getElementById('my-canvas');
    var context = canvas.getContext('2d');
    $scope.hideCanvas = false;

// first steps in the angular transition
    $scope.takePhoto = function() {
        console.log("draw")
        context.drawImage(video, 0, 0, 900, 600);
        var sendVid = canvas.toDataURL();
        $rootScope.$broadcast("send video data", {show: false, videoImage : sendVid})
        gui.Screen.DesktopCaptureMonitor.stop();
    };
  
//legacy for smooth transition  
    function takePhoto() {
        context.drawImage(video, 0, 0, 600, 400);
    };

    function savePhoto() {

        var data = photo.toDataURL("image/png");

        data = data.replace("image/png", "image/octet-stream");
        document.location.href = data;

    };



    gui.Screen.chooseDesktopMedia(
        ["window", "screen"],
        function(streamId) {
            var vid_constraint = {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId,
                    maxWidth: 900,
                    maxHeight: 600,
                    minFrameRate: 1,
                    maxFrameRate: 5
                },
                optional: []
            };
            navigator.webkitGetUserMedia({
                    audio: false,
                    video: vid_constraint
                },
                function(stream) {

                    console.log(stream, typeof URL.createObjectURL(stream));

                    video.src = URL.createObjectURL(stream);
                },
                function(error) {
                    console.log('failure', error);
                });
        });
}
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '../../html/video.html',
        controller: VideoCtrl
    };
});
