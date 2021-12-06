const express = require('express');
const passport = require('passport');
const router = express.Router();

const login = require('../controllers/login.controller');

router.get('/', login.getLogin);

router.post('/', passport.authenticate('local-login', {
  successReturnToOrRedirect: '/handleLogin',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', login.logout);

router.get('/register', login.getRegister);

router.post('/register', login.postRegister);

router.get('/forgotPassword', login.getForgotPassword);

router.post('/forgotPassword', login.postForgotPassword);

router.get('/forgotPassword/:token', login.getForgotPasswordToken);

router.post('/forgotPassword/:token', login.postForgotPasswordToken);

module.exports = router;