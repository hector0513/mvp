const mongoose = require('mongoose');
const moment = require('moment');

const Squema = mongoose.Schema;

var referredSchema = new Squema({
    createdAt: {
        type: String, 
        default: function(){return moment().format("DD/MM/yyyy");}
    },
    referred: { 
    	type: String,
      	required: true
    },
    user_referrer: { 
      	type: mongoose.Schema.Types.ObjectId,
      	ref: 'User',
      	required: true
    },
    joined: { 
      	type: Boolean,
      	default: false
    }
});

var Referred = mongoose.model('Referred', referredSchema);
module.exports = { Referred }