//Import all our dependencies
var express = require('express');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

//Set our static file directory to public
app.use(express.static(__dirname + '/public'));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

//Connect to mongo DB database
//use the below local mongodb for developement
//heroku
//mongoose.connect("mongodb://127.0.0.1:27017/scotch-chat");
mongoose.connect(uriUtil.formatMongoose("mongodb://heroku_qz5f9n32:gkr920qlmmbh94uet9p0491c00@ds051543.mongolab.com:51543/heroku_qz5f9n32"));

//Create a schema for chat
var ChatSchema = mongoose.Schema({
    created: Date,
    content: String,
    imageData: String,
    username: String,
    room: String
});


//Create a model from the chat schema
var Chat = mongoose.model('Chat', ChatSchema);

//Allow CORS
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});



/*||||||||||||||||||||||||||||||||||||||ROUTES||||||||||||||||||||||||||||||||||||||*/
//Route for our index file
app.get('/', function(req, res) {
    //send the index.html in our public directory
    res.sendfile('index.html');
});


//This route is simply run only on first launch just to generate some chat history
app.post('/setup', function(req, res) {
    //Array of chat data. Each object properties must match the schema object properties
    var chatData = [];

    //Loop through each of the chat data and insert into the database
    for (var c = 0; c < chatData.length; c++) {
        //Create an instance of the chat model
        var newChat = new Chat(chatData[c]);
        //Call save to insert the chat
        newChat.save(function(err, savedChat) {
        });
    }
    //Send a resoponse so the serve would not get stuck
    res.send('created');
});



//This route produces a list of chat as filterd by 'room' query
app.get('/msg', function(req, res) {
    //Find
    Chat.find({
        'room': req.query.room
    }).exec(function(err, msgs) {
        //console.log(err, "done");
        //Send
        res.json(msgs);
    });
});

/*------------------------------------User Routes--------------------------------------*/



/*||||||||||||||||||||||||||||||||||||||END ROUTES||||||||||||||||||||||||||||||||||||||*/

/*||||||||||||||||||||||||||||||||||||||SOCKET||||||||||||||||||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {
  //Globals
  var defaultRoom = 'general';
  var rooms = ["General", "Community","Feedback"];
  // var defaultRoom,rooms=[];

  socket.on('createRoom',function(data){
    defaultRoom=data.newRoom;
    rooms.push(data.newRoom);

  //Emit the rooms array
  socket.emit('setup', {
    rooms: rooms
  });

  });

  socket.on("new room created", function(obj){
    io.emit("new room to append to GUI", obj)
  })


  //Listens for new user
  socket.on('new user', function(data) {
    data.room = defaultRoom;
    //New user joins the default room
    socket.join(defaultRoom);
    //Tell all those in the room that a new user joined
    //io.in(defaultRoom).emit('user joined', data);
  });

    //Listens for new image
    socket.on('new image', function (img) {
        //console.log("stage 3", img);
        io.emit('image created', { image: true, buffer: img });
    });

    socket.on('new coordinates', function(coordinates) {
        io.emit('coordinates created', coordinates)
    });

    socket.on('newLine', function(obj) {
        io.emit('newLine', obj);
    });

    socket.on('clearCanvas', function(obj) {
        io.emit('clearCanvas', obj);
    });

    socket.on('beginPath', function(obj) {
       io.emit('newPath', obj);
    });

    socket.on('draw', function(obj) {
        io.emit('drawLine', obj);
    });

    socket.on('newImage', function(img) {
        io.emit('drawImage', img);
    });


    //Listens for new user
    socket.on('new user', function(data) {
        data.room = defaultRoom;
        //New user joins the default room
        socket.join(defaultRoom);
        //Tell all those in the room that a new user joined
        //io.in(defaultRoom).emit('user joined', data);
    });

    //Listen for new chat image
    socket.on('new chat image', function(data) {
      //create chat message
      var newImg = new Chat({
        username: data.username,
        content: data.message,
        room: data.room,
        imageData: data.imageData,
        created: new Date()
      });

      //save image to db
      newImg.save(function(err, data) {
        //emit to connected users in room
        io.emit('chat image created', data);
      });
    });

    //Listens for a new chat message
    socket.on('new message', function(data) {

        //Create message
        var newMsg = new Chat({
            username: data.username,
            content: data.message,
            room: data.room,
            created: new Date()
        });
        //Save it to database
        newMsg.save(function(err, msg) {
            //socket.emit('stellatest', msg);
            //Send message to those connected in the room
            io.emit('message created', msg);
        });
    });
});
/*||||||||||||||||||||||||||||||||||||||END SOCKETS||||||||||||||||||||||||||||||||||||||*/

//heroku

server.listen(process.env.PORT || 5000);
//server.listen(process.env.PORT || 2015);
console.log('It\'s going down in 2015');
