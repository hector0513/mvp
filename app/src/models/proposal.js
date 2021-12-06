const mongoose = require('mongoose');

const { User } = require('./user');
const moment = require('moment');

const Squema = mongoose.Schema;

var proposalSchema = new Squema({
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement'
    },
    price: {
      type: Number,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    estimatedTime:{
      type: Number
    },
    estimatedUnit:{
      type: String
    },
    acceptedDate: {
        type: String
    },
    acceptedTime: {
        type: Date
    },
    timeStampCreate: {
      type: Date
      },
    notified: {
      type: Boolean,
      default:false
    },
    status: {
      type: String, default: "Pending"
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      async validate(client_id){
        var user = await User.findById(client_id);

        if (!user)
          throw new Error('No se encontró un usuario con ese ID')

        if (!user.worker)
          throw new Error('El usuario ' + user.email + " no es un cliente para crear un requerimiento")

      }
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
    },
    extension: {
        requested:{
          type: Boolean,
          default: false
        },
        estimatedTime:{
          type: Number
        },
        estimatedUnit:{
          type: String
        },
        previousDeadline: Date,
        comment: String,
        acceptedDate: Date

      },
    file: {
      fileName: String,
      filePath: String
    }
});

var Proposal = mongoose.model('Proposal', proposalSchema);
module.exports = { Proposal }
