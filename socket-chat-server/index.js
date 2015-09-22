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
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Connect to mongo DB database
//use the below local mongodb for developement
//mongoose.connect("mongodb://127.0.0.1:27017/scotch-chat");
mongoose.connect(uriUtil.formatMongoose("mongodb://heroku_qz5f9n32:gkr920qlmmbh94uet9p0491c00@ds051543.mongolab.com:51543/heroku_qz5f9n32"));

//Create a schema for chat
var ChatSchema = mongoose.Schema({
  created: Date,
  content: String,
  username: String,
  room: String
});

/*var UserSchema = new mongoose.Schema({
      refresh:{type:Boolean, default: false},
      isAdmin: {type: Boolean, default: true},   
      firstName: String,
      lastName: String,
      displayName: String,
      password: String
      // phone: String,
      // userBlurb: String,
      //   email: {
      //       type: String
      //   },
      //   password: {
      //       type: String
      //   },
      //   salt: {
      //       type: String
      //   },
      //   google: {
      //       id: String,
      //       token: String,
      //   },
      //   pictureUrl: String,
      //   chatHistory:[{type: mongoose.Schema.Types.ObjectId, ref:"Chat"}]
});

var User = mongoose.model('User', UserSchema);*/


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

//start to login user
app.post('/user', function(req,res, next){
  User.findOne({password: req.body.password}).exec().then(function(user){
    console.log("hit " + user)
    res.json(user)
  }, next);
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
  var chatData = [{
    created: new Date(),
    content: 'Hi',
    username: 'Chris',
    room: 'php'
  }, {
    created: new Date(),
    content: 'Hello',
    username: 'Obinna',
    room: 'laravel'
  }, {
    created: new Date(),
    content: 'Ait',
    username: 'Bill',
    room: 'angular'
  }, {
    created: new Date(),
    content: 'Amazing room',
    username: 'Patience',
    room: 'socet.io'
  }];

  //Loop through each of the chat data and insert into the database
  for (var c = 0; c < chatData.length; c++) {
    //Create an instance of the chat model
    var newChat = new Chat(chatData[c]);
    //Call save to insert the chat
    newChat.save(function(err, savedChat) {
      console.log(savedChat);
    });
  }
  //Send a resoponse so the serve would not get stuck
  res.send('created');
});



//This route produces a list of chat as filterd by 'room' query
app.get('/msg', function(req, res) {
  //Find
  Chat.find({
    'room': req.query.room.toLowerCase()
  }).exec(function(err, msgs) {
    console.log(err, msgs);
    //Send
    res.json(msgs);
  });
});

/*------------------------------------User Routes--------------------------------------*/

//This route gets all the users from the data base
app.get('/user', function(req,res, next){
  User.find().exec().then(function(users){
    console.log("hit " + users)
    res.json(users)
  }, next);
});

//Create a new user with a post request
app.post('/user', function(req,res,next){
  console.log(req.body)
		User.create(req.body).then(function(user){
			res.status(201).json(user);
		})
		.then(null,next);
});

/*||||||||||||||||||||||||||||||||||||||END ROUTES||||||||||||||||||||||||||||||||||||||*/

/*||||||||||||||||||||||||||||||||||||||SOCKET||||||||||||||||||||||||||||||||||||||*/
//Listen for connection
io.on('connection', function(socket) {
  //Globals
  var defaultRoom = 'general';
  var rooms = ["General", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];

  //Emit the rooms array
  socket.emit('setup', {
    rooms: rooms
  });

  //Listens for new user
  socket.on('new user', function(data) {
    data.room = defaultRoom;
    //New user joins the default room
    socket.join(defaultRoom);
    //Tell all those in the room that a new user joined
    io.in(defaultRoom).emit('user joined', data);
  });

  //Listens for switch room
  socket.on('switch room', function(data) {
    //Handles joining and leaving rooms
    //console.log(data);
    socket.leave(data.oldRoom);
    socket.join(data.newRoom);
    io.in(data.oldRoom).emit('user left', data);
    io.in(data.newRoom).emit('user joined', data);

  });

  //Listens for a new chat message
  socket.on('new message', function(data) {
    //Create message
    var newMsg = new Chat({
      username: data.username,
      content: data.message,
      room: data.room.toLowerCase(),
      created: new Date()
    });
    //Save it to database
    newMsg.save(function(err, msg){
      //Send message to those connected in the room
      io.in(msg.room).emit('message created', msg);
    });
  });
});
/*||||||||||||||||||||||||||||||||||||||END SOCKETS||||||||||||||||||||||||||||||||||||||*/

server.listen(process.env.PORT || 5000);
console.log('It\'s going down in 2015');
