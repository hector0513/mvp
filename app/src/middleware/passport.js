const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const fs = require('fs');

var {User} = require('../models/user');


module.exports = function (passport) {
  	// required for persistent login sessions
  	// passport needs ability to serialize and unserialize users out of session
  	passport.serializeUser(function (user, done) {
    	done(null, user.id);
  	});

  	// used to deserialize user
  	passport.deserializeUser(function (id, done) {
    	User.findById(id, function (err, user) {
      	done(err, user);
    	});
  	});

 /**
	* LocalStrategy
	* Set the local login
	*/
 	passport.use('local-login', new LocalStrategy({
	 	usernameField: 'email',
	 	passwordField: 'password',
	 	passReqToCallback: true
 	},
 	function (req, email, password, done) {
 		//console.log(req.body)
 		email = email.toLowerCase();
 		let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
 		// Find user using email
 		User.findOne({ email }, async function(err, user) {

		 	// if there are any errors, return the error before anything else
		 	if (err) return done(err);
		 	if (user) {
			 	if (!user.local.password){
				   return done(null, false, req.flash('loginMessage', "Intenta iniciar sesión con Google"));
			 	} else {

				 	if (!user.validPassword(password)){
				 	      return done(null, false, req.flash('loginMessage', "El correo o la contraseña que ingresaste son incorrectos"));
				 	}

				 	var worker = (req.body.worker == "on");

				 	user.worker = worker;
				 	await user.save();

				 	return done(null, user); //for automatic login
			 	}
		 	} else {
			 	return done(null, false, req.flash('loginMessage', "El correo o la contraseña que ingresaste son incorrectos."));
		 	}

	 	});

	}));
}
