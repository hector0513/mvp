let request = require('request')
const { User } = require('../models/user');
const { Wallet } = require('../models/wallet');

const walletCtrl = {};

/**
 * Adds money to the wallet
 * @param {int} amount - The ammount to charge.
 * @param {int} creditCardNumber - Credit card number.
 * @param {int} cvc - Credit card CVC/CVV .
 * @param {string} expiration_month - two digit month .
 * @param {int} expiration_year - four digit year.
 * @param {string} country - credit card country.
 * @param {string} email - credit card owner email.
 */
walletCtrl.topup = async (req, res) =>{

	let form_sitca = {
		monto: req.body.topup_amount,
		numero: req.body.topup_card_number,
		cvc: req.body.topup_cvv,
		mes: req.body.topup_expiry_month,
		ano: req.body.topup_expiry_year,
		moneda: "USD",
		referencia: 1234
  	}

  	console.log(form_sitca)

  	options = {
		method: 'POST',
		url: process.env.BANCAMIGA_URL,
		headers: {'apikey': process.env.BANCAMIGA_KEY,'Content-Type': 'application/json' },
		formData: form_sitca
	}

	console.log(options);

	request(options, async function (error, response, ibody) {
		if (error) {

		  	console.log(error);
		  	res.redirect('/client');

		} else {

			console.log(response);
		 	console.log(ibody);
		 	let parsedResponse = JSON.parse(ibody);
			console.log(parsedResponse);

			if(parsedResponse.aprobado){

				try{

					var wallet = new Wallet;
					var user = new User;

					//personal info
					wallet.user = req.user._id

					wallet.rechargeWallet.amount = req.body.topup_amount
					wallet.rechargeWallet.email = req.body.topup_email
					wallet.rechargeWallet.nameCard = req.body.topup_card_name
					wallet.rechargeWallet.country = req.body.topup_country
					wallet.status = "Aprobada"

					var user = await User.findById(req.user._id);

					console.log(user);

					user.wallet += wallet.rechargeWallet.amount

					wallet.historyWallet = user.wallet

					user.save();

					var wallet = await wallet.save();

					res.status(200).send(wallet._id);

				} catch (e){

					console.log(e)
					res.status(500).send(e);

				}

			}
		}
	});
}

/**
 * Release money using a wireTransfer petition
 * @param {int} amount - The ammount to egress.
 * @param {string} name - Owner's name.
 * @param {string} bank - Name of the bank.
 * @param {int} routing - Routing number.
 * @param {int} bankAccountNumber - Bank account number.
 * @return {string} ID of the wallet
 */
walletCtrl.checkout = async (req, res) =>{

  	console.log(req.body)
  	if (!req.user){
  		return res.status(404).send("No se encontró usuario para recargar")
  	}

  	try {

	  	var wallet = new Wallet();

	  	wallet.retirementWallet.amount = req.body.checkout_amount
	  	wallet.retirementWallet.name = req.body.checkout_name
	  	wallet.retirementWallet.bank = req.body.bank
	  	wallet.retirementWallet.routing = req.body.checkout_routing
	  	wallet.retirementWallet.bankAccountNumber = req.body.checkout_bankAccount
		wallet.retirementWallet.checkoutMethod = req.body.option

		var user = await User.findById(req.user._id);
		wallet.historyWallet = user.wallet

	  	wallet.user = req.user._id

	  	await wallet.save()

	  	res.status(200).send("Recarga guardada exitosamente!")

	} catch (e) {

		console.log(e)
		res.status(500).send("Error guardando el registro del Wallet")

	}

}

module.exports = walletCtrl;
