const express = require('express');
const router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const opportunity = require('../controllers/opportunity.controller');

router.post('/extension', opportunity.extension);

router.post('/proposal/create', opportunity.proposalCreate);
router.post('/proposal/edit', opportunity.proposalEdit);
router.post('/proposal/accept', opportunity.proposalAccept);
router.post('/proposal/reject', opportunity.proposalReject);
router.post('/proposal/walletPayment', opportunity.walletPayment);
router.post('/proposal/cardPayment', opportunity.cardPayment);
router.post('/proposal/extension', opportunity.extension);
router.post('/inProgress/walletPayment', opportunity.progressWalletPayment);
router.post('/inProgress/cardPayment', opportunity.progressCardPayment);
router.post('/uploadAttachment/:id', opportunity.uploadAttachment);
router.post('/reject', opportunity.reject);
router.post('/rejectWork', opportunity.rejectWork);
router.post('/extendWork', opportunity.extendWork);

module.exports = router;
