const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var uniPetitionSchema = new Squema({
    category: { 
    	type: String,
    	required: true
    },
    university_name: String,
    university_career: String,
    work_category: String,
    work_subcategory: String,
    university_country: String,
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      default: "Pendiente"
    }
});

var UniPetition = mongoose.model('UniPetition', uniPetitionSchema);
module.exports = { UniPetition }