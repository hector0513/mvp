let request = require('request')
const formidable = require('formidable');
const path = require('path');
const fs = require('fs')
const { Requirement } = require('../models/requirement')
const { Proposal } = require('../models/proposal')
const { User } = require('../models/user')
const { Wallet } = require('../models/wallet')

const ejs = require('ejs');
const moment = require('moment');

const { transporter } = require('../utilities');

const navCtrl = {};
/**
 * Send an email to contact asilinks
 * @param {string} email - user email.
 * @param {string} subject - email subject.
 * @param {string} comment - email comment.
 * @return {string} - Message of the operation
 */
navCtrl.contact = async (req, res) =>{

  try {
  	// Get user token to send
  	// var compiled = ejs.compile(fs.readFileSync(__dirname + '/../views/email_templates/refers_mailling.ejs', 'utf-8'));
  	// var html = compiled({ headers : req.headers.host });

    var user = `Usuario: ${req.body.email}`
    var subject  = `Asunto: ${req.body.subject}`
    var comment = `Comentario: ${req.body.comment}`

    var html = "<html><body><p>"+user+"</p><p>"+subject+"</p><p>"+comment+"</p></body></html>"
  	var mailOptions = {
    	from: 'Asilinks <admin@asilinks.com>',
    	to: 'soporte@asilinks.com', // list of receivers
    	subject: req.body.subject, // Subject line
    	html: html
  	};

  	// Send Email
  	await transporter.sendMail(mailOptions, async function(error, info){
    	if(error){
    		console.log(error);
  			return res.send({message: 'Intente más tarde'});
  		}else{
  			console.log('Email enviado: ' + info.response);

  		};
  	});


  	var mailOptionsUser = {
    	from: 'Asilinks <admin@asilinks.com>',
    	to: req.body.email, // list of receivers
    	subject: req.body.subject, // Subject line
    	html: "<html><body><p>Hola, hemos recibido tu correo, serás atendido en la brevedad posible</p></body></html>"
  	};

  	// Send Email
  	await transporter.sendMail(mailOptionsUser, async function(error, info){
    	if(error){
    		console.log(error);
  			return res.send({message: 'Intente más tarde'});
  		}else{
  			console.log('Email enviado: ' + info.response);
  		};
  	});

    return res.send({message:"¡Mensaje enviado!"})


  } catch (e){
    console.log(e);
    return res.send({message:"Error al procesar"})
  }
}


module.exports = navCtrl;
