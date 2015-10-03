var express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');

var routes = require('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/*', routes.index);

//app.set('port', process.env.PORT || 4000);
app.set('port', process.env.PORT || 5000);

var server = app.listen(app.get('port'), function() {
	// log a message to console!
    console.error('Port at 4k');
});

module.exports = app;
