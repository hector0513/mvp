const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var categorySchema = new Squema({
    about: {
    	type: String
    },
    category: {
      type: String,
      required: true
    },
    sub_category: {
      type: String,
      required: false
    },
    enable: {
      type: Boolean,
      default: false
    },
    habilities: [String]
});

var Category = mongoose.model('Category', categorySchema);
module.exports = { Category }
