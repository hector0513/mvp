const express = require("express");
const router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

const partner = require("../controllers/partner.controller");

router.get("/", ensureLoggedIn("/login"), partner.getHome);

router.get("/profile", ensureLoggedIn("/login"), partner.getProfile);

router.get("/getUniversities/:studyCountry", partner.getUniversities);

router.get("/getCareers/:uni", partner.getCareers);

router.post("/updateInfo", partner.updateInfo);

router.post("/inviteUser", partner.inviteUser);

router.get("/opportunity/:id",ensureLoggedIn("/login"),partner.seeRequirement);

router.get("/opportunity/inProgress/:id",ensureLoggedIn("/login"),partner.progressRequirement);

router.post("/rateClient/:client",ensureLoggedIn("/login"),partner.rateClient);

router.get("/wallet", ensureLoggedIn("/login"), partner.getWallet);
router.post("/updateCategories",partner.categoriesPost);

// TO DO List
// router.get("/todo/list", ensureLoggedIn("/login"), partner.getTODO);
router.post("/todo/create", ensureLoggedIn("/login"), partner.createTask);
router.post("/todo/edit", ensureLoggedIn("/login"), partner.editTask);
router.post("/todo/delete", ensureLoggedIn("/login"), partner.deleteTask);
router.post("/todo/search", ensureLoggedIn("/login"), partner.searchTask);
router.post("/todo/check", ensureLoggedIn("/login"), partner.checkTask);
router.post("/todo/sort", ensureLoggedIn("/login"), partner.sortList);


router.get("/notice/list", ensureLoggedIn("/login"), partner.listNotice);
router.post("/notice/create", ensureLoggedIn("/login"), partner.createNotice);
router.post("/notice/edit", ensureLoggedIn("/login"), partner.editNotice);
router.post("/notice/delete", ensureLoggedIn("/login"), partner.deleteNotice);

router.get("/service/:notice/:client", ensureLoggedIn("/login"),partner.noticeChat);

module.exports = router;
