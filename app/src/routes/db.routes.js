const express = require('express');
const router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const db = require('../controllers/db.controller');

router.get('/loadCountries', ensureLoggedIn('/login'), db.loadCountries);
router.get('/loadCategories', ensureLoggedIn('/login'), db.loadCategories);
router.get('/loadCategoriesFull', db.loadCategoriesFull);
router.get('/loadUni', ensureLoggedIn('/login'), db.loadUni);
router.get('/loadCareer', ensureLoggedIn('/login'), db.loadCareer);
router.post('/addUniversity', ensureLoggedIn('/login'), db.addUniversity);

module.exports = router;
