let request = require('request')

const moment = require('moment');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const { transporter } = require('../utilities');

const { User } = require('../models/user');
const { Country } = require('../models/country')
const { University } = require('../models/university')
const { Category } = require('../models/category')
const { Requirement } = require('../models/requirement')
const { Referred } = require('../models/referred')
const { Career } = require('../models/career')
const { Wallet } = require('../models/wallet')
const { Proposal } = require('../models/proposal')
const { Chat } = require('../models/chat')
const { Notice } = require('../models/notice')

const clientCtrl = {};

clientCtrl.categoriesPost = async (req, res) =>{
  if (!req.body.categories) req.body.categories = []
  if (!req.body.interest) req.body.interest = []
  try {
    var user = await User.findOneAndUpdate(
      {_id:req.user._id},
      {$set: {"workInfo.categories": req.body.categories,
             "interest": req.body.interest}},
      {new: true}
    );
    res.send("ok")
  } catch(e){
    console.log(e);
    res.send("error");
  }
}

/**
 * Redirects the user to its proper profile
 */
clientCtrl.getHome = async (req, res) =>{

  	if (!req.user.worker)
		  return res.redirect("/partner")

	var requirement = await Requirement.find({ client: req.user });
	var referreds = await Referred.find({user_referrer: req.user}, "referred").distinct("referred");
	var users = await User.find({email: referreds});
	var wallet = await Wallet.find({ user : req.user });

  var week = ["D","L","M","M","J","V","S"]
  var opp = await Requirement.find({"client":req.user._id, "status": "Iniciado"}).populate("subcategory client partner proposal");
  var calendar = []
  for (var w=0;w<7;w++){
    var current_date = new Date();
    var next_date = new Date(current_date.setDate(current_date.getDate() + w));
    var task = opp.find(r => moment(r.proposal.deadline).format("DD/MM/YYYY") == moment(next_date).format("DD/MM/YYYY"))
    calendar.push({
      weekday: week[next_date.getDay()],
      date: next_date.getDate(),
      current: next_date,
      task: task
    })
  }

    var notice = await Notice.find({clients:req.user._id}).populate("partner");

  	res.render('pages/Client/home',
	  {
		user: req.user,
		requirement,
		referreds,
		users,
		wallet,
    calendar,
    notice
	  });
}

/**
 * Render the balance chart based on the wallet
 */
clientCtrl.getGraphics = async (req, res) =>{

	if (!req.user.worker)
		return res.redirect("/partner")

	var wallet = await Wallet.find({ user : req.user });
	console.log('Request for Client graphics received');
	res.render('pages/Client/graphics',
	{
	  user: req.user,
	  wallet
	});
}

/**
 * Render the view with all wallet transactions
 */
clientCtrl.getWallet = async (req, res) =>{

	if (!req.user.worker)
		return res.redirect("/partner")

	var wallet = await Wallet.find({ user : req.user });

	console.log('Request for Client wallet received');
	res.render('pages/Client/wallet',
	{
	  user: req.user,
	  wallet
	});
}

/**
 * Adds money to the wallet
 * @param {int} amount - The ammount to charge.
 * @param {int} creditCardNumber - Credit card number.
 * @param {int} cvc - Credit card CVC/CVV .
 * @param {string} expiration_month - two digit month .
 * @param {int} expiration_year - four digit year.
 * @param {string} country - credit card country.
 * @param {string} email - credit card owner email.
 * @return {string} Message and status
 */
clientCtrl.updateWallet = async (req, res) =>{

	let form_sitca = {
		monto: req.body.amount,
		numero: req.body.creditCardNumber,
		cvc: req.body.cvv,
		mes: req.body.expiration_month,
		ano: req.body.expiration_year,
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

						wallet.rechargeWallet.amount = req.body.amount
						wallet.rechargeWallet.email = req.body.email
						wallet.rechargeWallet.nameCard = req.body.nameCard
						wallet.rechargeWallet.country = req.body.country
						wallet.status = req.body.status

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
clientCtrl.egressWallet = async (req, res) =>{

	try{

		var wallet = new Wallet;

		//personal info
		wallet.user = req.user._id

		wallet.retirementWallet.amount = req.body.amount
		wallet.retirementWallet.name = req.body.name
		wallet.retirementWallet.bank = req.body.bank
		wallet.retirementWallet.routing = req.body.routing
		wallet.retirementWallet.bankAccountNumber = req.body.bankAccountNumber
		wallet.retirementWallet.status = req.body.status
		wallet.retirementWallet.checkoutMethod = "WireTransfer"
		var user = await User.findById(req.user._id);
		wallet.historyWallet = user.wallet
	  	var wallet = await wallet.save();

		res.status(200).send(wallet._id);

	} catch (e){

		console.log(e)
		res.status(500).send(e);

	}
}

/**
 * Render view to create a requirement
 */
clientCtrl.getRequirement = async (req, res) =>{

  if (!req.user.worker)
    return res.redirect("/partner")
  var category = await Category.find({}, "category").sort({ name: 1 }).distinct("category");
  var countries = await Country.find({}, "name").distinct("name");
  // push venezuela
  var vene = ["Venezuela"]
  countries = vene.concat(countries);

  var private = req.query.private;
  var notice = req.query.notice;

  res.render('pages/Client/requirement',
  {
    user: req.user,
    category,
    private,
    notice,
    countries
  });

}

/**
 * Get the user profile
 */
clientCtrl.getProfile = async (req, res) =>{

	if (!req.user.worker)
		return res.redirect("/partner")

		var countries = await Country.find({}, "name").distinct("name");
    var vene = ["Venezuela"]
    countries = vene.concat(countries);
		var category = await Category.find({}, "category").sort({ name: 1 }).distinct("category");

		var referreds = await Referred.find({user_referrer: req.user}, "referred").distinct("referred");
		var users = await User.find({email: referreds});

  		// Para el cumpleaños del usuario
      var birthday = moment(req.user.dob).add(1, "day").format("yyyy-MM-DD")
      var categories = await Category.find().sort({ name: 1 });
  	var value = 90;
	res.render('pages/Client/profile', {
		user: req.user,
		birthday,
		value,
		countries,
		category,
    categories,
		users
	});
}

/**
 * Release money using a wireTransfer petition
 * @param {string} firstname - Client firstname.
 * @param {string} lastname - Client lastname.
 * @param {string} userId - User ID.
 * @param {date} dob - Birth date.
 * @param {string} bornCountry - Country.
 * @param {string} livingCity - City.
 * @param {string} studyCountry - Study country.
 * @param {string} institution - Name of institution.
 * @param {string} career - Career.
 * @param {string} specialty - Specialty.
 * @param {string} yearsExp - Years of experience.
 * @param {string} workCategory - Work category.
 * @param {string} workSub - Work subcategory.
 * @return {string} Operation message status
 */
clientCtrl.updateInfo = async (req, res) =>{

	try {

		var user = await User.findById(req.user._id);

		if (!user)
			return res.status(404).send("No se encontró el usuario que se quiere actualizar");

		const form = formidable();

		form.uploadDir = "src/assets/uploads/users"
		form.keepExtensions = true;

	    form.parse(req, async function (err, fields, files) {
	    	console.log(fields)
			//personal info
		  	user.firstname = fields.firstname
		  	user.lastname = fields.lastname
		  	user.userId = fields.userId
		  	user.dob = fields.dob
			user.country = fields.bornCountry
			user.city = fields.livingCity
			user.gender = fields.radio2
		  	//studyInfo
		  	user.studyInfo.studyCountry = fields.studyCountry
		  	user.studyInfo.institution = fields.institution
		  	user.studyInfo.career = fields.career
		  	user.studyInfo.specialty = fields.specialty
		  	//workInfo
		  	user.workInfo.yearsExp = fields.yearsExp
		  	user.workInfo.workCategory = fields.workCategory
			user.workInfo.workSub = fields.workSub
			if (files.resume.size && files.resume.size > 0){
			user.workInfo.fileOfName = files.resume.name
			}

		  	try {
			  	// si tiene archivo nuevo, elimina el previo y cambia el path
			  	if (files.profPic.size > 0){

			  		// si es distinto a la foto por defecto la elimina del servidor
			  		if (user.photo != '/assets/images/user.png'){

			  			var old_photo = "src/" + user.photo;
			  			fs.unlink(old_photo, function() {
			  				console.log('deleted previous client photo ' + old_photo)
			  			})

			  		}

					user.photo = "/assets/uploads/users/" + path.basename(files.profPic.path)

			  	} else {

			  		fs.unlink(files.profPic.path, function() {
			  			console.log('deleted temp client photo ' + files.profPic.path)
			  		})

			  	}

		  	} catch (e) {

		  		console.log(e)
		  		return res.status(500).send("Error actualizando la foto de perfil del cliente")

		  	}

		  	try {
			  	// si tiene archivo nuevo, elimina el previo y cambia el path
			  	if (files.resume.size > 0){

			  		if (user.workInfo.resume)
			  			fs.unlink('src/' + user.workInfo.resume, function() {
			  				console.log('deleted previous client cv src/' + user.workInfo.resume)
			  			})

					user.workInfo.resume = "/assets/uploads/users/" + path.basename(files.resume.path)

			  	} else {

		  			fs.unlink(files.resume.path, function() {
		  				console.log('deleted temp client cv ' + files.resume.path)
		  			})

			  	}
		  	} catch (e) {

		  		console.log(e)
		  		return res.status(500).send("Error actualizando el CV del cliente")

		  	}

		  	await user.save();

	    });

	    form.on('error', function(err) {

			console.log(err);
			res.status(500).send("Error leyendo el form");

		});

	    form.on('end', function() {

			console.log('done!')
	    	res.redirect('/client/profile')

		});

	} catch(e){

		console.log(e);
		res.status(500).send("Error leyendo el form de usuario");

	}

}


clientCtrl.sendResume = async (req, res) =>{

	console.log(req.body)

	res.sendStatus(200)

}

/**
 * Get the requirement description for possible proposals
 */
clientCtrl.getClientDescription = async (req, res) =>{
try {

	if (!req.user.worker)
		return res.redirect("/partner")

	var requirement = await Requirement.findById(req.query.id).populate('proposal');

  var proposals = await Proposal.find({requirement:req.query.id, status: {$ne: "Rejected"}}).populate('partner');
  for(var p=0; p<proposals.length; p++){
    proposals[p].deadline = moment(proposals[p].deadline).format("DD/MM/YYYY");
  }

  if (requirement.proposal && requirement.proposal.status=="Accepted"){
      res.redirect("/client/requirement/inProgress?id="+requirement._id)
  } else {

    res.render('pages/Client/requirement-description',
    {
      user: req.user,
      requirement,
      proposals,
      moment
    });

  }

  } catch(e){
    console.log(e);
    res.sendStatus(500).send(e)
  }

}

/**
 * Get the in progress requirement
 */
clientCtrl.getClientRequirement = async (req, res) =>{

	if (!req.user.worker)
		return res.redirect("/partner")

	var requirement = await Requirement.findById(req.query.id).populate('proposal');
  // var proposal = await Proposal.find({requirement:req.query.id, status: {$ne: "Rejected"}}).populate('partner');

  var client = await User.findById(requirement.client)
  var partner = await User.findById(requirement.proposal.partner)

  if (client.lastLogin) client.lastLogin = moment(client.lastLogin).format("DD/MM/YYYY hh:mm a");
  if (partner.lastLogin) partner.lastLogin = moment(partner.lastLogin).format("DD/MM/YYYY hh:mm a");
  var chats = await Chat.findOne({requirement: req.query.id})
  var chat = [];
  if (chats) chat = chats.chat;

  if(String(client._id)!=String(req.user._id)){
    return res.redirect("/client")
  } else {

    var isRated = false;
    if (partner.rating.length>0) {
      var rate_partner = partner.rating.find(r => String(r.requirement)==String(requirement._id))
      if (rate_partner) isRated = true;
    }

	res.render('pages/Client/requirement-inProgress',
		{
		  user: req.user,
		  requirement,
      chat,
      cliente: client, //client is a EJS reserved key
      partner,
      moment: moment,
      isRated
		});

  }
}

/**
 * Get the requirement description for possible proposals
 * @return {category} Object type category
 */
clientCtrl.getSubcategories = async (req, res) => {

    try {

    	var category = await Category.find({ category: req.params.category }).sort({ name: 1 });

      	res.send(category);

    }catch (e){
      	console.log(e)
      	res.sendStatus(500);
    }
}

/**
 * Create a new Requirement
 * @param {string} description - The requirement description.
 * @param {string} english_level - English level.
 * @param {string} partner_country - Country of the partner.
 * @return {string} Message
 */
clientCtrl.newRequirement = async (req, res) =>{

	try {

		const form = formidable();
		form.uploadDir = "src/assets/uploads/requirements"
		form.keepExtensions = true;

		form.parse(req, async function (err, fields, files) {

			var requirement = new Requirement;

			   //personal info
		  	requirement.client = req.user._id
		  	requirement.name = fields.name
        if (req.query.private){
          requirement.private = req.query.private;
        }

        if (req.query.notice){
          requirement.notice = req.query.notice;
        }
			var category = await Category.findOne({ category: fields.category,
		  		sub_category: fields.subcategory
		  	})
			requirement.subcategory = category._id
      requirement.rejected = []
			requirement.category_name = category.category
			requirement.subcategory_name = category.sub_category
	  	requirement.description = fields.description
	  	requirement.english_level = fields.english_level
	  	requirement.partner_country = fields.partner_country
	  	requirement.knowledge = fields.radio2
			requirement.development_time = fields.radio22

		  	// Son varios
		  	if (req.body.partner_title){

			  	req.body.partner_title.forEach( (pt) => {

			  		let pt1 = { title: pt }
			  		requirement.partner_title.push(pt1)

				})

		 	}

		  	try {
			  	// si tiene archivo nuevo, elimina el previo y cambia el path
			  	if (files.upload.size > 0){

			  		requirement.file = "/assets/uploads/requirements/" + path.basename(files.upload.path)

			  	} else {

			  		fs.unlink(files.upload.path, function() {
			  			console.log('deleted requirement temp file ' + files.upload.path)
			  		})

			  	}

		  	} catch (e) {

		  		console.log(e)
		  		return res.status(500).send("Error guardando el archivo")

		  	}
		  	var requirement = await requirement.save();
		});
	    form.on('error', function(err) {
			console.log(err);
			res.status(500).send("Error leyendo el form");
		});
	    form.on('end', function() {
			console.log('done!')
	    	res.redirect('/client#newrequirement')
		});
	} catch (e){
		console.log(e)
		res.send(500, e);
	}

}

/**
 * Get university list
 * @param {string} studyCountry - university country.
 * @return {university} - Object type university
 */
clientCtrl.getUniversities = async (req, res) => {

    try {

    	var country = await Country.findOne({ name: req.params.studyCountry }).sort({ name: 1 });
    	var uni = await University.find({ country: country._id }).sort({ name: 1 });
      	res.send(uni);
    }catch (e){
      	console.log(e)
      	res.sendStatus(500);
    }
}

/**
 * Get career list
 * @param {string} uni - university.
 * @return {career} - Object type career
 */
clientCtrl.getCareers = async (req, res) => {

    try {
    	var career = await Career.find({ university: req.params.uni }).sort({ career: 1 });
      	res.send(career);
    }catch (e){
      	console.log(e)
      	res.sendStatus(500);
    }
}

/**
 * Invites a user into the platform
 * @param {string} email - the potential user email.
 * @return {string} - Message of the operation
 */
clientCtrl.inviteUser = async (req, res) =>{

try {

	// Busca si este usuario ya está registrado
	var user = await User.findOne({ email: req.body.email })

	// Si lo encuentra, retorna que ya existe (409 - conflict)
	if (user) {
    console.log("el usario ya existe");
    return res.send({message:"¡Este usuario ya está registrado en Asilinks!"});
  } else {

	// Get user token to send
	var compiled = ejs.compile(fs.readFileSync(__dirname + '/../views/email_templates/refers_mailling.ejs', 'utf-8'));
	var html = compiled({ headers : req.headers.host , firstname: req.user.firstname, lastname: req.user.lastname});

	var mailOptions = {
	from: 'Asilinks <admin@asilinks.com>',
	to: req.body.email, // list of receivers
	subject: 'Únete a la comunidad Asilinks!', // Subject line
	html: html
	};

	// Send Email
	await transporter.sendMail(mailOptions, async function(error, info){

		if(error){

			console.log(error);
			var alert_message = 'Ocurrió un error invitando a tu compañero!';
			return res.send({message:'¡Ocurrió un error invitando a tu compañero!'});

		}else{

			console.log('Email enviado: ' + info.response);

			try {

				var ref_user = new Referred();

				ref_user.referred = req.body.email;
				ref_user.user_referrer = req.user._id;

				await ref_user.save()
				return res.send({message:'¡Invitación enviada! Esperamos verlo pronto por aquí!'});

			} catch (e) {

				console.log('Error agregando el referido a BD', e);
				return res.send({message:'¡Error agregando el referido a BD'});

			}

		};

	});
}
} catch (e){
  console.log(e);
  return res.send({message:"Error al procesar"})
}
}

/**
 * Rate a partner once a requirement is completed
 * @param {string} requirement - the requirement ID.
 * @param {string} rate - The rating from very bad to very good.
 * @param {string} comment - a comment of performance.
 */
clientCtrl.ratePartner = async (req, res) =>{
  try {
    var rate = {"requirement": req.body.requirement, "performance": req.body.rate, "client": req.user._id, "comment": req.body.comment}
    var partner = await User.findOneAndUpdate({_id: req.params.partner},{$push: {rating: rate}}, {new: true})
    res.redirect("/client/requirement/inProgress?id="+req.body.requirement)
  } catch (e){
    console.log(e);
    res.redirect("/client")
  }
}

/**
 * Rate a partner once a requirement is completed
 * @param {string} requirement - the requirement ID.
 * @param {string} rate - The rating from very bad to very good.
 * @param {string} comment - a comment of performance.
 */
clientCtrl.noticeChat = async (req, res) =>{

  try {
    var notice = await Notice.findById(req.params.notice).populate("partner");
    var chat = await Chat.findOne({notice: notice._id, client: req.params.client});
    if (String(req.params.client) == String(req.user._id) ){
      res.render('pages/Client/notice-chat',
        {
          user: req.user,
          notice,
          chat,
          value:0,
          cliente: req.user,
          moment: moment
        });
    } else if (String(req.params.client) == String(notice.partner._id)){
      res.redirect("/partner/service/"+notice._id+"/"+req.params.client);
    } else {
      res.redirect("/client/");
    }
  } catch (e){
    console.log(e);
    res.redirect("/client")
  }
}





module.exports = clientCtrl;
