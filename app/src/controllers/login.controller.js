const express = require("express");
var router = express.Router();
const _ = require("lodash");
const passport = require("passport");
const moment = require("moment");
require("../middleware/passport")(passport);
const fs = require("fs");
const ejs = require("ejs");

const { User } = require("../models/user");
const { Country } = require("../models/country");
const { Referred } = require("../models/referred");

const { transporter } = require("../utilities");
var algorithms = require("../assets/scripts/algorithms");
const loginCtrl = {};

/**
 * ARender the sign up view
 * @param {object} res - Response
 * @param {object} body - The body of the request
 * @param {string} message - Message in case of failure.
 */
async function renderRegister(res, body, message) {
  var countries = await Country.find({}, "name").distinct("name");
  res.render("auth/register", {
    body,
    countries,
    message,
  });
}

/**
 * Render the login view
 */
loginCtrl.getLogin = (req, res) => {
  if ((res.locals.user = req.isAuthenticated()))
    return res.redirect("/partner");

  var message = req.flash().loginMessage;
  var changeCorrect= req.query.password;
  if (changeCorrect=="true") message = "Confirmación enviada. Revise su correo y siga las indicaciones"
  if (changeCorrect=="false") message = "Usuario no encontrado"
  if (changeCorrect=="error") message = "Error al completar la petición de recuperación de contraseña"

  res.render("auth/login", {
    message,
  });
};

/**
 * Render the sign up view
 */
loginCtrl.getRegister = async (req, res) => {
  renderRegister(res, {}, "");
};

/**
 * Logs out the user
 */
loginCtrl.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
};

/**
 * Register a new user
 * @param {string} firstname - Client firstname.
 * @param {string} lastname - Client lastname.
 * @param {date} dob - Birth date.
 * @param {string} bornCountry - Country.
 * @param {string} livingCity - City.
 * @param {string} password - User password.
 * @param {string} confirmPassword - User password.
 * @param {string} worker - user as client or partner.
 * @return {string} Operation message status
 */
loginCtrl.postRegister = async (req, res, done) => {
  // Get the data from the form
  var body = _.pick(req.body, [
    "firstname",
    "lastname",
    "bornCountry",
    "livingCity",
    "dob",
    "email",
    "paypalEmail",
    "password",
    "confirmPassword",
    "worker",
  ]);

  // Si esta on (true), es un cliente. Si no está (false), es un socio y se guarda false por defecto
  body.worker = body.worker === "on";

  // Check if user is already registered
  if (body.password != body.confirmPassword) {
    return res.render("auth/register", {
      body,
      countries,
      message: "Las contraseñas envíadas no coinciden.",
    });
  }

  var countries = await Country.find({}, "name").distinct("name");
  // Valida la contraseña
  var passwordMessage = algorithms.validatePassword(body.password);
  if (passwordMessage) {
    return res.render("auth/register", {
      body,
      countries,
      message: passwordMessage,
    });
  }

  User.findOne({ email: body.email }, function (err, user) {
    // In case of any error return
    if (err) {
      // if error found
      return renderRegister(
        res,
        body,
        "Error en la creación de la cuenta, intente de nuevo."
      );
    }
    // if user exists
    if (user) {
      return renderRegister(
        res,
        body,
        "Ya existe una cuenta asociada a este email."
      );
    } else {
      // Create user

      var promise_username = algorithms.generateUsername(body.email);

      promise_username.then((username) => {
        try {
          var newUser = new User();
          // var tokenURL = newUser.generateToken(email); // token for email verification
          newUser.local.password = newUser.generateHash(body.password); // use the generateHash function in our user model
          newUser.local.confirmed = false;
          //newUser.local.accessToken = tokenURL;
          newUser.firstname = body.firstname;
          newUser.lastname = body.lastname;
          newUser.worker = body.worker;
          newUser.country = body.bornCountry;
          newUser.city = body.livingCity;
          newUser.dob = body.dob;
          newUser.paypal = body.paypalEmail;
          newUser.username = username.toLowerCase();
          newUser.email = body.email.toLowerCase();
          newUser.createdAt = moment().format("DD/MM/YYYY");

          // save the user
          newUser.save(function (err) {
            if (err) {
              console.log(err);
              return renderRegister(
                res,
                body,
                "Error guardando su usuario. Por favor revise sus correos ingresados."
              );
            }

            checkReferral(newUser.email);

            passport.authenticate("local-login", {
              successReturnToOrRedirect: "/handleLogin",
              failureRedirect: "/login",
              failureFlash: true,
            })(req, res, function () {
              backURL = req.header("Referer") || "/";
              res.redirect(backURL);
            });
          });
        } catch (e) {
          console.log(e);
          return renderRegister(
            res,
            body,
            "Error guardando su usuario. Por favor reintente"
          );
        }
        // };
      });
    }
  });
};


/**
 * Checks if the user was invited
 * @param {string} email - user email.
 */
async function checkReferral(email) {
  var refers = await Referred.updateMany({ referred: email }, { joined: true });
  console.log(refers.n + " usuarios invitaron a " + email);
}


/**
 * Render the forgot password view
 */
loginCtrl.getForgotPassword = (req, res) => {
  res.render("auth/forgot");
};

/**
 * Handles the forgotten passport sending a toker by email
 * @param {string} email - the user email
 * @return {string} message of the operation
 */
loginCtrl.postForgotPassword = async (req, res) => {
  try {
    var user = await User.findOne({ email: req.body.email });
    var alert_message = {};

    // encuentra al usuario
    if (user) {
      // Generates token
      var tokenURL = User().generateToken(req.body.email); //user.local.accessToken;

      await User.findOneAndUpdate(
        { email: req.body.email },
        { $set: { "local.accessToken": tokenURL } },
        { new: true }
      );

      // Get user token to send
      var compiled = ejs.compile(
        fs.readFileSync(
          __dirname + "/../views/email_templates/forbidden_key.ejs",
          "utf-8"
        )
      );
      var html = compiled({ headers: req.headers.host, tokenURL });

      var mailOptions = {
        from: "Asilinks <admin@asilinks.com>", // sender address
        to: req.body.email, // list of receivers
        subject: "Recuperación de contraseña Asilinks", // Subject line
        html: html, // You can choose to send an HTML body instead
      };

      // Send Email
      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          alert_message.message = "Error envíando el correo de recuperación";
          alert_message.type = "danger";
        } else {
          console.log("Email enviado: " + info.response);
          alert_message.message =
            "Confirmación enviada. Revise su correo y siga las indicaciones";
          alert_message.type = "success";
        }

        return res.status(200).send(alert_message);
      });
      // Si no existe usuario asociado al correo
    } else {
      alert_message.message = "Usuario no encontrado";
      alert_message.type = "danger";

      return res.status(200).send(alert_message);
    }
  } catch (e) {
    console.log(e);
    alert_message.message =
      "Error al completar la petición de recuperación de contraseña";
    alert_message.type = "danger";

    return res.status(500).send(alert_message);
  }
};

/**
 * Render the forgot password view with the token received by email
 * @param {string} token - The token
 */
loginCtrl.getForgotPasswordToken = (req, res) => {
  var alert_message;
  var token = req.params.token;

  res.render("auth/forgotToken", {
    alert_message,
    token,
  });
};

/**
 * Render the password change view based on the token
 * @param {string} token - the token
 */
loginCtrl.postForgotPasswordToken = async (req, res) => {
  var alert_message = {};

  // get the token by URL from email link
  var token = req.params.token;
  // Get user assosiated
  try {
    var user = User.findOne({ "local.accessToken": token });

    if (!user) {
      req.flash("loginMessage", "Token de recuperación no válido");
      return res.redirect("/login");
    } else {
      var hash_password = User().generateHash(req.body.password);

      // if user is found set verified and remove token
      await user.update(
        {
          $set: { "local.password": hash_password },
          $unset: { "local.accessToken": "" },
        },
        function (err, result) {
          if (err) {
            alert_message.message = "Error actualizando su contraseña";
            alert_message.type = "danger";

            return res.render("auth/forgotToken/" + token, {
              alert_message,
            });
            console.log(err);
          }

          req.flash(
            "loginMessage",
            "Su contraseña ha sido actualizada exitosamente"
          );
          return res.redirect("/login");
        }
      );
    }
  } catch (e) {
    alert_message.message = "Token expirado o no válido";
    alert_message.type = "danger";
    console.log(e);
    return res.render("auth/forgotToken/" + token, {
      alert_message,
    });
  }
};

module.exports = loginCtrl;
