app.controller('VideoCtrl', function($state, $scope){

// Tool maker
// var CanvasDesigner = (function() {
//     var iframe;
//     var tools = {
//         line: true,
//         pencil: true,
//         dragSingle: true,
//         dragMultiple: true,
//         eraser: true,
//         rectangle: true,
//         arc: true,
//         bezier: true,
//         quadratic: true,
//         text: true
//     };
//     var selectedIcon = 'pencil';

//     function syncData(data) {
//         if (!iframe) return;

//         iframe.contentWindow.postMessage({
//             canvasDesignerSyncData: data
//         }, '*');
//     }

//     var syncDataListener = function(data) {};
    
//     function onMessage() {
//         if (!event.data || !event.data.canvasDesignerSyncData) return;
//         syncDataListener(event.data.canvasDesignerSyncData);
//     }

//     window.addEventListener('message', onMessage, false);

//     return {
//         appendTo: function(parentNode ,img) {
//             iframe = document.createElement('iframe');
//             iframe.src = 'js/Canvas-Designer/widget.html?tools=' + JSON.stringify(tools) + '&selectedIcon=' + selectedIcon;
//             iframe.setAttribute('id', 'myframe');
//             iframe.style.width = '600px';
//             iframe.style.height = '600px';
//             iframe.style.border = 0;
//             parentNode.appendChild(iframe);
//         },
//         destroy: function() {
//             if(iframe) {
//                 iframe.parentNode.removeChild(iframe);
//             }
//             window.removeEventListener('message', onMessage);
//         },
//         addSyncListener: function(callback) {
//             syncDataListener = callback;
//         },
//         syncData: syncData,
//         setTools: function(_tools) {
//             tools = _tools;
//         },
//         setSelected: function(icon) {
//             if (typeof tools[icon] !== 'undefined') {
//                 selectedIcon = icon;
//             }
//          },
//         setImage: function(img){
             
//         }
//     };
// })();

//sets drawing window
    $scope.draw = false;
    
    var gui = require('nw.gui');

    console.log(gui);



    gui.Screen.Init();

    var video = document.querySelector('video');
    var canvas = document.getElementById('first-canvas');
    var context = canvas.getContext('2d');
    // var drawWindow = document.getElementById('canvas-window');

// first steps in the angular transition
    $scope.takePhoto = function() {
        console.log("draw")
       context.drawImage(video, 0, 0, 600, 600);
        $scope.draw = true;
        // CanvasDesigner.appendTo(drawWindow, drawing);
        //  var shareIframe = document.getElementById('myframe');
        //  var iframeDocument = shareIframe.contentDocument || shareIframe.contentWindow.document
        //  var iframeContent = iframeDocument.getElementById('main-canvas');
        // console.log("This is my canvas",shareIframe, iframeDocument, iframeContent)
    };
  
    $scope.goToVideo = function(){
        $scope.draw = false;
        // console.log(CanvasDesigner)
    }
    

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
                    maxWidth: 600,
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
        
        
        
  

})