require('./config/config');
require('dotenv').config()

const express = require ('express');
const morgan = require('morgan');
const passport = require('passport');
require('./middleware/passport')(passport);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');

const path = require('path');
const app = express();

const mongoose = require ('./database');

// Settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use( express.static( "src" ) );
mongoose.set('useFindAndModify', false);

// Receive POST in JSON format through forms
app.use(bodyParser.urlencoded({
    extended: true
}));
// Session for flash
app.use(session({
	secret: 'secretsalt',
	resave: false,
	saveUninitialized: false,
  cookie: {
    maxAge: 1000*60*60*24*31
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

// Routes
require('./routes.js')(app, passport);

const server = require('http').Server(app);
require('./sockets.js')(server)

// Starting the server
server.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});
