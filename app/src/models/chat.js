const mongoose = require('mongoose');

const Squema = mongoose.Schema;

var chatSchema = new Squema({
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    },
    notice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice'
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    chat: [
      { message: String,
        time: String,
        user:mongoose.Schema.Types.ObjectId
      }
    ]
});

var Chat = mongoose.model('Chat', chatSchema);
module.exports = { Chat }
