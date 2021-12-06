const express = require("express");
const passport = require("passport");
const router = express.Router();
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

const admin = require("../controllers/admin.controller");

router.get("/dashboard/walletPetitions", admin.getWalletPetitions);

router.post("/handleWalletPetition", admin.handleWalletPetition);

router.get("/dashboard/universityPetitions", admin.getUniversityPetitions);

router.post("/handleUniversityPetition", admin.handleUniversityPetition);

router.get("/dashboard", ensureLoggedIn("/login"), admin.getDashboard);

router.get(
  "/dashboard/categories",
  ensureLoggedIn("/login"),
  admin.getDashboardCategories
);

router.get(
  "/dashboard/subcategories",
  ensureLoggedIn("/login"),
  admin.getDashboardSubCategories
);

router.get(
  "/dashboard/subcategories",
  ensureLoggedIn("/login"),
  admin.getDashboardSubCategories
);

router.get(
  "/dashboard/country",
  ensureLoggedIn("/login"),
  admin.getDashboardCountry
);

router.get(
  "/dashboard/university",
  ensureLoggedIn("/login"),
  admin.getDashboardUniversity
);

module.exports = router;
