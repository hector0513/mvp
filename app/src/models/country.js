const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var countrySchema = new Squema({
    name: { 
    	type: String,
    	required: true
    },
    iso_code: { 
      type: String,
      required: true
    }
});


var Country = mongoose.model('country', countrySchema);

module.exports = { Country }