const express = require('express');
const router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const wallet = require('../controllers/wallet.controller');

router.post('/topup', wallet.topup);

router.post('/checkout', wallet.checkout);

module.exports = router;