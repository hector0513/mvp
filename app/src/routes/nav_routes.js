const express = require("express");
const router = express.Router();

const nav = require("../controllers/nav.controller");
router.get("/", (req, res) => {
  console.log("Request for home received");
  res.render("pages/index");
});

router.get("/info", (req, res) => {
  console.log("Request for how it works received");
  res.render("pages/info");
});

router.get("/benefits", (req, res) => {
  console.log("Request for benefits received");
  res.render("pages/benefits");
});

router.get("/faq", (req, res) => {
  console.log("Request for FAQ received");
  res.render("pages/FAQ");
});

router.get("/contact", (req, res) => {
  console.log("Request for contact received");
  res.render("pages/contact");
});

router.get("/administration", (req, res) => {
  console.log("Request for contact received");
  res.render("pages/administration");
});

router.get("/accounting", (req, res) => {
  console.log("Request for accounting received");
  res.render("pages/accounting");
});

router.get("/finance_and_business", (req, res) => {
  console.log("Request for finance and business received");
  res.render("pages/finance_and_business");
});

router.get("/foreign_trade", (req, res) => {
  console.log("Request for foreign trade received");
  res.render("pages/foreign_trade");
});

router.get("/communications", (req, res) => {
  console.log("Request for communications received");
  res.render("pages/communications");
});

router.get("/building", (req, res) => {
  console.log("Request for building received");
  res.render("pages/building");
});

router.get("/design", (req, res) => {
  console.log("Request for design received");
  res.render("pages/design");
});

router.get("/business", (req, res) => {
  console.log("Request for design received");
  res.render("pages/business");
});

router.get("/management", (req, res) => {
  console.log("Request for management received");
  res.render("pages/management");
});

router.get("/about_us", (req, res) => {
  console.log("Request for about us received");
  res.render("pages/about_us");
});

router.get("/ingenieria", (req, res) => {
  console.log("Request for ingenieria received");
  res.render("pages/ingenieria");
});

router.get("/legal", (req, res) => {
  console.log("Request for legal received");
  res.render("pages/legal");
});

router.get("/terms", (req, res) => {
  console.log("Request for about us received");
  res.render("pages/terms");
});

router.get("/ethics", (req, res) => {
  console.log("Request for about us received");
  res.render("pages/ethics");
});

router.post("/contact/", nav.contact);
router.get("/handleLogin", (req, res) => {
  if (req.user.worker) return res.redirect("/client");
  else return res.redirect("/partner");
});

router.get("/calendar", (req, res) => {
  res.render("pages/calendar");
});

module.exports = router;
