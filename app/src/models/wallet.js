const mongoose = require('mongoose');

const { User } = require('./user');

const moment = require('moment');

const Squema = mongoose.Schema;

var walletSchema = new Squema({
    createdAt: {
        type: String, 
        default: function(){return moment().format("DD/MM/yyyy");}
    },
    rechargeWallet: {
        amount: Number,
        email: String,
        creditCardNumber: String,
        expiration: String,
        cvv: String,
        nameCard: String,
        country: String,
      },
    retirementWallet: {
        amount: Number,
        name: String,
        bank: String,
        routing: String,
        bankAccountNumber: String,
        checkoutMethod: String,
      },
    timeStampCreate: {
      type: Date,
      default: Date.now()
      },
    historyWallet: {
      type: Number,
      },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      async validate(user_id){
        var user = await User.findById(user_id);

        if (!user)
          throw new Error('No se encontró un usuario con ese ID')

      }
    },
    status: {
      type: String,
      default: "Pendiente"
    }
});

var Wallet = mongoose.model('Wallet', walletSchema);
module.exports = { Wallet }