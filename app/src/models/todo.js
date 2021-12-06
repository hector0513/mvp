const mongoose = require('mongoose');

const { User } = require('./user');
const moment = require('moment');

const Squema = mongoose.Schema;

var todoSchema = new Squema({
    description: String,
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    },
    priority: {
      type: Number // (0:low, 1:medium, 2:high).
    },
    deadline: {
      type: Date,
      required: true
    },
    tags: [String],
    status: {
        type: String,
        default: "Pending"
    },
    timeStampCreate: {
      type: Date
    },
    completed: {
      type: Date
    },
    order: {
      type:Number,
      default: 0
    },
    notified: {
      type: Boolean,
      default: false
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      async validate(client_id){
        var user = await User.findById(client_id);
        if (!user)
          throw new Error('No se encontró un usuario con ese ID')

        if (user.worker)
          throw new Error('El usuario ' + user.email + " no es un socio para aceptar el requerimiento")

      }
    }
});

var ToDo = mongoose.model('ToDo', todoSchema);

module.exports = { ToDo }
