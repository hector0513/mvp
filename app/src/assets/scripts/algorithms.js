const validator = require('validator');

var { User } = require('../../models/user');

/* Genera el username cuando un usuario se registra */
async function generateUsername(email) {

	var email_part= email.split("@");
	var username_exists = await User.findOne({username: email_part[0]});
	if (username_exists) {

  		var random = Math.floor(Math.random()*100);
  		return email_part[0]+random;

	} else {

  		return email_part[0];

	}
}


function validatePassword(password){

	if ( validator.isAlpha(password) )
		return 'La contraseña no es alfanumérica';

    if (password.toLowerCase().includes('contraseña'))
		return 'La contraseña no puede incluir la palabra \'contraseña\'';

    if (password.toLowerCase().includes(' '))
		return 'La contraseña no puede incluir espacios';

    if (validator.isEmpty(password))
		return 'La contraseña no puede ser vacía';

    if (!validator.isLength(password, { min: 8, max: 16 }))
		return 'La contraseña no se encuentra entre los rangos establecidos (8-16 caracteres)';

	var passRegex = new RegExp("^(?=.*\\d)(?=.*[\\u0021-\\u002f\\u003c-\\u0040])(?=.*[A-Z])(?=.*[a-z])\\S{8,16}$");

	if ( !passRegex.test(password) )
		return 'La contraseña no cumple con las especificaciones mencionadas';

	return false;

}

module.exports = {

    generateUsername,
    validatePassword

}