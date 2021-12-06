const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var uniSchema = new Squema({
    name: { 
    	type: String
    },
    shortname: { 
      type: String
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country'
    }
});

var University = mongoose.model('University', uniSchema);
module.exports = { University }