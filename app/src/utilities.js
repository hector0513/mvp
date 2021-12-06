
var nodemailer = require('nodemailer');

/* Handler for email sending */
var transporter = nodemailer.createTransport({
	service: 'Zoho',
	host: "smtp.zoho.com",
	port: 465,
    secure: false, //ssl
	auth: {
		user: process.env.ZOHO_ACCOUNT, // Email
		pass: process.env.ZOHO_PASSWORD // Email password
	},
	pool:true
});

module.exports = {
	transporter
};
