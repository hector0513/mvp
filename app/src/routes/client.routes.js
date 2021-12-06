const express = require('express');
const router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const client = require('../controllers/client.controller');

router.get('/', ensureLoggedIn('/login'), client.getHome);

router.get('/requirement', ensureLoggedIn('/login'), client.getRequirement);

router.get('/profile', ensureLoggedIn('/login'), client.getProfile);

router.get('/graphics', ensureLoggedIn('/login'), client.getGraphics);

router.get('/wallet', ensureLoggedIn('/login'), client.getWallet);

router.post('/updateWallet', ensureLoggedIn('/login'), client.updateWallet);

router.post('/egressWallet', ensureLoggedIn('/login'), client.egressWallet);

router.post('/updateInfo', client.updateInfo);

router.post('/sendResume', client.sendResume);

router.get('/getUniversities/:studyCountry', client.getUniversities);

router.get('/getCareers/:uni', client.getCareers);

router.post('/inviteUser', client.inviteUser);

router.get('/getSubcategories/:category', ensureLoggedIn('/login'), client.getSubcategories);

router.get('/requirement-description', ensureLoggedIn('/login'), client.getClientDescription);

router.get('/requirement/inProgress', ensureLoggedIn('/login'), client.getClientRequirement);

router.post('/newRequirement', ensureLoggedIn('/login'), client.newRequirement);

router.post("/ratePartner/:partner", ensureLoggedIn("/login"),client.ratePartner);

router.post("/updateCategories",client.categoriesPost);

router.get("/service/:notice/:client", ensureLoggedIn("/login"),client.noticeChat);

module.exports = router;
