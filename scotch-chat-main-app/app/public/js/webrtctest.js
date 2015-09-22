var socket = io.connect('http://pubsub.pubnub.com/fiksi', {
    publish_key: 'pub-c-f682df93-447e-4ff7-ae7e-0172e0043fe2',
    subscribe_key: 'sub-c-a81b1968-60b9-11e5-8923-02ee2ddab7fe',
    ssl: true,
    /* <<< for HTTPS */
    channel: 'fiksiApp'
});

/* socket is opened: it is your time to transmit request! */
function onconnect() {}

/* got response */
function oncallback(response) {}

var offerPeer = RTCPeerConnection({
    attachStream	: clientStream,
    onICE     		: function (candidate) {},
    onRemoteStream  	: function (stream) {},
    onOfferSDP    	: function(sdp) {}
});

var answerPeer = RTCPeerConnection({
    attachStream     	: clientStream,

    onICE     		: function (candidate) {},
    onRemoteStream  	: function (stream) {},
    
    // see below two additions ↓
    offerSDP      	: offer_sdp,
    onAnswerSDP   	: function(sdp) {}
});

offerPeer.addAnswerSDP( answer_sdp );

offerPeer.addICE({
    sdpMLineIndex 	: candidate.sdpMLineIndex,
    candidate 		: candidate.candidate
});

answerPeer.addICE({
    sdpMLineIndex 	: candidate.sdpMLineIndex,
    candidate 		: candidate.candidate
});

socket.on('connect', onconnect);
socket.on('message', oncallback);

