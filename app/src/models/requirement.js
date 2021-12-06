const mongoose = require('mongoose');

const { User } = require('./user');

const Squema = mongoose.Schema;

var requirementSchema = new Squema({
    name: {
    	type: String
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    notice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice'
    },
    category_name: {
      type: String
    },
    subcategory_name: {
      type: String
    },
    description: {
      type: String
    },
    partner_title: [{
        title: {
          type: String
        }
    }],
    english_level: {
      type: String
    },
    partner_country: {
      type: String
    },
    knowledge: {
      type: String
    },
    development_time: {
      type: String
    },
    status: {
      type: String, default: "Sin Iniciar"
    },
    file: {
      type: String
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
    rejected:[mongoose.Schema.Types.ObjectId],
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    },
    private: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentDone:{
      type: Boolean,
      default: false
    },
    paymentDate:{
      type: Date
    },
    fileName: {
      type:String
    },
    otherFiles: [{
      fileName: String,
      filePath: String
    }],
    fileComment: String,
    acceptedDate: {
      type: Date
    }

});

var Requirement = mongoose.model('Requirement', requirementSchema);
module.exports = { Requirement }
