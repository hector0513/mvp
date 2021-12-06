const mongoose = require("mongoose");

const { User } = require("./user");
const moment = require("moment");

const Squema = mongoose.Schema;

var noticeSchema = new Squema({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Requirement",
  },
  status: {
    type: String,
    default: "Active",
  },
  name: String,
  description: String,
  timeStampCreate: {
    type: Date,
  },
  categories: [
    {
      workCategory: String,
      workSub: String,
      hability: String,
      categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
      },
    },
  ],
  estimatedTime: {
    type: Number,
  },
  estimatedUnit: {
    type: String,
  },
  price: {
    type: Number,
  },

  clients: [mongoose.Schema.Types.ObjectId],
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    async validate(client_id) {
      var user = await User.findById(client_id);
      if (!user) throw new Error("No se encontró un usuario con ese ID");

      if (user.worker)
        throw new Error(
          "El usuario " +
            user.email +
            " no es un socio para aceptar el requerimiento"
        );
    },
  },
});

var Notice = mongoose.model("Notice", noticeSchema);
module.exports = { Notice };
