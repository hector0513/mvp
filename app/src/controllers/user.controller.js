const { User } = require('../models/user');

const userCtrl = {};

/**
 * Get all users
 */
userCtrl.getUsers = async (req, res) =>{
    const users = await User.find({});
    res.json(users);
}
/**
 * Create user
 */
userCtrl.createUsers = async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json({
        'status': 'User Saved'
    });
};

/**
 * Get user by ID
 * @param {string} id - user ID
 */
userCtrl.getUser =  async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
}

/**
 *  Edit user
 * @param {string} id - user ID
 * @param {string} name - name of the user.
 * @param {string} position - .
 * @param {string} office - .
 * @param {int} salary - current salary.
 * @return {string} Message and status
 */
userCtrl.editUser =  async (req, res) => {
    const { id } = req.params;
    const user = {
        name: req.body.name,
        position: req.body.position,
        office: req.body.office,
        salary: req.body.salary
    }
    await User.findByIdAndUpdate(id, {$set: user}, {new: true});
    res.json({status: 'User Updated'});
}

/**
 *  Delete user by ID
 * @param {string} id - user ID
 * @return {string} Message and status
 */
userCtrl.deleteUser =  async (req, res) => {
    await User.findByIdAndRemove(req.params.id);
    res.json({status: 'User Deleted'});
};

/**
 * change user profile from client to partner
 * @param {string} id - user ID
 * @return {string} Message and status
 */
userCtrl.changeWork =  async (req, res) => {

    if (!req.user)
        return res.status(404).send("El usuario no ha iniciado sesión. Por favor recargue la página.")

    var user = await User.findById(req.user._id);

    try {
        user.worker = !user.worker
        await user.save()
        return res.redirect('/partner')

    } catch (e) {

        return res.status(500).send("Error actualizando el estado de trabajador del usuario")
    }
};

/**
 * Invites a user into the platform
 * @param {string} email - the potential user email.
 * @return {string} - Message of the operation
 */
userCtrl.inviteUser = async (req, res) =>{

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
	var html = compiled({ headers : req.headers.host });

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


module.exports = userCtrl;
