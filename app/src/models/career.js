const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var careerSchema = new Squema({
    university: { 
    	type: String,
      required: true
    },
    career: { 
      type: String,
      required: true
    },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country'
    }
});

var Career = mongoose.model('Career', careerSchema);
module.exports = { Career }