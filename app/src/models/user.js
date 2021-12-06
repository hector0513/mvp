const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const Squema = mongoose.Schema;

var userSchema = new Squema({
    createdAt: {
      type: String,
    },
    firstname: {
    	type: String,
    	required: true
    },
    lastname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    photo: {
      type: String,
      default: '/assets/images/user.png'
    },
    rank: {
      type: String,
      default: "bronze"
    },
    userId: {
      type: String
    },
    studyInfo: {
      studyCountry: String,
      institution: String,
      career: String,
      specialty: String
    },
    workInfo: {
      yearsExp: String,
      categories: [{
        workCategory: String,
        workSub: String,
        hability: String,
        categoryID:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'category'
        },
      }],
      workCategory: String,
      workSub: String,
      resume: String,
      fileOfName: String
    },
    wallet: {
      type: Number,
      default: 0
    },
    gender: {
      type: String,
    },
    interest: [{
      workCategory: String,
      workSub: String,
      hability: String,
      categoryID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
      },
    }],
    email: {
      type: String,
      trim: true,
      minlength: 1,
      unique:true,
      validate(value){
          if ( !validator.isEmail(value)){
              throw new Error('Correo indicado no es una cuenta válida de email')
          }
      }
    },
    paypal: {
      type: String,
      trim: true,
      minlength: 1,
      validate(value){
          if ( !validator.isEmail(value)){
              throw new Error('Correo de paypal no es una cuenta válida de email')
          }
      }
    },
    local: {
    	id: String,
    	password: String,
    	token: String,
    	confirmed: Boolean,
    	accessToken: String
  	},
    worker: {
    	type: Boolean,
    	required: true,
    	default: false
    },
    rating: [{
      performance: String,
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      comment: String,
      requirement:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requirement'
      }
    }],
    lastLogin: Date,
    previousLogin: Date,
    lastConnection: String,
    is_superuser: {
      type:Boolean,
      default: false
    }
    /*position: {
    	type: String,
    	required: true
    },
    office: {
    	type: String,
    	required: true
    },
    salary: {
    	type: Number,
    	required: true
    }*/
});

userSchema.methods.generateAuthToken = function () {
 var user = this;
 var access = 'auth';
 return jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
};

userSchema.statics.findByAuthToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    'email': decoded.email,
    'local.token': token
  });
 };

// Confirmation email token
userSchema.methods.generateToken = function (email) {

  var user = this;
  var access = 'verify';
  return jwt.sign({email: email, access}, process.env.JWT_SECRET).toString();

};

userSchema.statics.findByToken = function (token) {

  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    'email': decoded.email,
    'local.accessToken': token
  });

};

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.isVerified = function() {
  return this.local.confirmed;
};

var User = mongoose.model('User', userSchema);
module.exports = { User }
