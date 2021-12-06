const express = require("express");
var router = express.Router();

const { User } = require("../models/user");
const { Requirement } = require("../models/requirement");
const { Wallet } = require("../models/wallet");
const { Country } = require("../models/country");
const { Career } = require("../models/career");
const { Category } = require("../models/category");
const { University } = require("../models/university");
var { UniPetition } = require("../models/uniPetition");
const { Referred } = require("../models/referred");
const adminCtrl = {};

/**
 * Get all wallet petitions
 */
adminCtrl.getWalletPetitions = async (req, res) => {
  if (req.user.is_superuser) {
    var petitions = await Wallet.find().populate("user");

    res.render("pages/admin/walletPetitions", {
      petitions,
    });
  } else {
    res.redirect("/");
  }
};

/**
 * Handle wallet petitions
 * @return {string} Message and status
 */
adminCtrl.handleWalletPetition = async (req, res) => {
  var petition = await Wallet.findById(req.body.pet_id);

  if (!petition)
    return res
      .status(404)
      .send("No se encontró la petición que se desea actualizar");

  try {
    if (req.body.status == "Aprobada") {
      try {
        var user = await User.findById(petition.user);

        if (petition.rechargeWallet.amount)
          user.wallet += petition.rechargeWallet.amount;
        else user.wallet -= petition.retirementWallet.amount;
        petition.historyWallet = user.wallet;

        user.save();
      } catch (e) {
        console.log(e);
        return res.status(500).send("Error actualizando el monto del usuario");
      }
    }

    petition.status = req.body.status;

    petition.save();

    return res.status(200).send("Petición actualizada con éxito!");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error guardando la actualización de petición");
  }
};

/**
 * Get all university petitions
 */
adminCtrl.getUniversityPetitions = async (req, res) => {
  var petitions = await UniPetition.find().populate("user");

  res.render("pages/admin/universityPetitions", {
    petitions,
  });
};

/**
 * Manage the university petitions
 */
adminCtrl.handleUniversityPetition = async (req, res) => {
  console.log(req.body);
  var petition = await UniPetition.findById(req.body.pet_id);

  // Si hay un error enviando la petición, la rechazada inmediatamente
  if (!petition)
    return res
      .status(404)
      .send("No se encontró la petición que se desea actualizar");

  try {
    // Cosas que hacer si la petición fue aprobada.
    // Si es rechazada, solo salta todo esto
    if (req.body.status == "Aprobada") {
      try {
        // Si querian actualizar una universidad
        if (petition.category == "Universidad") {
          // Busca si esta universidad ya existe
          var country = await Country.findOne({
            name: petition.university_country,
          });
          var oldUni = await University.findOne({
            name: petition.university_name,
            country: country._id,
          });

          // Si la universidad existe, termina la ejecución.
          // Aprueba la solicitud y le avisa al usuario
          if (oldUni) {
            petition.status = req.body.status;

            petition.save();
            return res.status(200).send("Esta universidad ya está registrada!");
          }

          // Guarda los datos de la universidad si no existe
          var uni = new University();

          uni.country = country._id;
          uni.name = petition.university_name;

          // Si hay algun error guardando la universidad
          uni.save(function (err) {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .send("Error guardando la universidad nueva");
            }
          });

          // Para las carreras
        } else if (petition.category == "Carrera") {
          // Busca si la carrera ya existe
          var oldCareer = await Career.findOne({
            career: petition.university_career,
            university: petition.university_name,
          });

          // Si ya existe la carrera, termina la ejecución
          // Le avisa al usuario que ya existe
          if (oldCareer) {
            petition.status = req.body.status;

            petition.save();
            return res.status(200).send("Esta carrera ya está registrada!");
          }

          // Guarda la carrera nueva
          var career = new Career();
          career.career = petition.university_career;
          career.university = petition.university_name;

          var country = await Country.findOne({
            name: petition.university_country,
          });

          // Revisa si la universidad de la carrera existe
          var uni = await University.findOne({
            name: petition.university_name,
            country: country._id,
          });

          // Si no existe, agrega la universidad a la base de datos
          if (!uni) {
            var newUni = new University();

            newUni.country = country._id;
            newUni.name = petition.university_name;

            newUni.save(function (err) {
              if (err) {
                console.log(err);
                return res
                  .status(500)
                  .send("Error guardando la universidad de la carrera nueva");
              }
            });
          }

          career.save(function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send("Error guardando la carrera nueva");
            }
          });

          // Si es una categoria laboral
        } else {
          // Busca si la categoria laboral existe
          var oldCategory = await Category.findOne({
            category: petition.work_category,
            sub_category: petition.work_subcategory,
          });

          // Si existe la categoria, termina la ejecución
          // Le avisa al usuario que ya existe
          if (oldCategory) {
            petition.status = req.body.status;

            petition.save();
            return res
              .status(200)
              .send("Esta categoría laboral ya está registrada!");
          }

          // Crea la nueva categoría
          var category = new Category();

          category.category = petition.work_category;
          category.sub_category = petition.work_subcategory;

          category.save(function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send("Error guardando la categoria nueva");
            }
          });
        }
      } catch (e) {
        console.log(e);
        return res.status(500).send("Error actualizando el monto del usuario");
      }
    }

    petition.status = req.body.status;

    petition.save();

    return res.status(200).send("Petición actualizada con éxito!");
  } catch (e) {
    console.log(e);
    res.status(500).send("Error guardando la actualización de petición");
  }
};

adminCtrl.getDashboard = async (req, res) => {
  if (req.user.is_superuser) {
    try {
      // Basic Query

      var users = await User.find();
      var pending = await Requirement.find({ status: "Sin Iniciar" }).count();
      var in_progress = await Requirement.find({ status: "Iniciado" }).count();
      var finished = await Requirement.find({ status: "Finalizado" }).count();
      var cancelled = await Requirement.find({ status: "Cancelado" }).count();
      var invited = await Referred.find().count();
      var joined = await Referred.find({ joined: true }).count();
      var unregistered = await Referred.find({ joined: false }).count();

      // Advanced Query

      // Categories
      var all_categories = await Category.find()
        .sort("category")
        .distinct("category");
      var usersByCategories = [];

      for (var c = 0; c < all_categories.length; c++) {
        var usersByCategory = await User.find({
          "workInfo.workCategory": all_categories[c],
        }).countDocuments();
        //console.log(item, usersByCategory);
        usersByCategories.push({
          category: all_categories[c],
          users: usersByCategory,
        });
      }

      // Subcategories
      var all_subcategories = await Category.find();
      var usersBySubCategories = [];

      for (var s = 0; s < all_subcategories.length; s++) {
        var usersBySubCategory = await User.find({
          "workInfo.workSub": all_subcategories[s].sub_category,
        }).countDocuments();
        //console.log(item, usersByCategory);
        usersBySubCategories.push({
          subcategory: all_subcategories[s].sub_category,
          users: usersBySubCategory,
        });
      }

      // Country
      var all_countries = await Country.find();
      var usersByCountries = [];
      for (var co = 0; co < all_countries.length; co++) {
        var usersByCountry = await User.find({
          country: all_countries[co].name,
        }).countDocuments();
        usersByCountries.push({
          country: all_countries[co].name,
          users: usersByCountry,
        });
      }

      // University
      var all_universities = await University.find();
      var usersByUniversities = [];
      for (var u = 0; u < all_universities.length; u++) {
        var usersByUniversity = await User.find({
          "studyInfo.institution": all_universities[u].name,
        }).countDocuments();
        usersByUniversities.push({
          university: all_universities[u].name,
          users: usersByUniversity,
        });
      }
    } catch (e) {
      console.log(e);
    }
    res.render("pages/admin/dashboard", {
      user: req.user,
      user_count: users.length,
      in_progress,
      pending,
      finished,
      cancelled,
      invited,
      joined,
      unregistered,
      usersByCategories,
      usersBySubCategories,
      usersByCountries,
      usersByUniversities,
    });
  } else {
    res.redirect("/");
  }
};

adminCtrl.getDashboardCategories = async (req, res) => {
  if (req.user.is_superuser) {
    try {
      var users = await User.find();

      // Categories
      var all_categories = await Category.find()
        .sort("category")
        .distinct("category");
      var usersByCategories = [];

      for (var c = 0; c < all_categories.length; c++) {
        var usersByCategory = await User.find({
          $or: [{ "workInfo.workCategory": all_categories[c] }, { "workInfo.categories.workCategory": all_categories[c] }]
        }).count();
        //console.log(item, usersByCategory);
        usersByCategories.push({
          category: all_categories[c],
          users: usersByCategory,
        });
      }
    } catch (e) {
      console.log(e);
    }

    res.render("pages/admin/dashboardCategory", {
      user: req.user,
      user_count: users.length,
      usersByCategories,
    });
  } else {
    res.redirect("/");
  }
};

adminCtrl.getDashboardSubCategories = async (req, res) => {
  if (req.user.is_superuser) {
    try {
      var users = await User.find();

      // Subcategories
      var all_subcategories = await Category.find();
      var usersBySubCategories = [];

      for (var s = 0; s < all_subcategories.length; s++) {
        var usersBySubCategory = await User.find({
          $or: [{ "workInfo.workSub": all_subcategories[s].sub_category}, { "workInfo.categories.workSub": all_subcategories[s].sub_category }]
        }).count();
        //console.log(item, usersByCategory);
        usersBySubCategories.push({
          category: all_subcategories[s].category,
          subcategory: all_subcategories[s].sub_category,
          users: usersBySubCategory,
        });
      }
    } catch (e) {
      console.log(e);
    }

    res.render("pages/admin/dashboardSubCategory", {
      user: req.user,
      user_count: users.length,
      usersBySubCategories,
    });
  } else {
    res.redirect("/");
  }
};

adminCtrl.getDashboardCountry = async (req, res) => {
  if (req.user.is_superuser) {
    try {
      var users = await User.find();

      // Country
      var all_countries = await Country.find();
      var usersByCountries = [];
      for (var co = 0; co < all_countries.length; co++) {
        var usersByCountry = await User.find({
          country: all_countries[co].name,
        }).count();
        usersByCountries.push({
          country: all_countries[co].name,
          users: usersByCountry,
        });
      }
    } catch (e) {
      console.log(e);
    }

    res.render("pages/admin/dashboardCountry", {
      user: req.user,
      user_count: users.length,
      usersByCountries,
    });
  } else {
    res.redirect("/");
  }
};

adminCtrl.getDashboardUniversity = async (req, res) => {
  if (req.user.is_superuser) {
    try {
      var users = await User.find();

      // University
      var all_universities = await University.find();
      var usersByUniversities = [];
      for (var u = 0; u < all_universities.length; u++) {
        var usersByUniversity = await User.find({
          "studyInfo.institution": all_universities[u].name,
        }).count();
        usersByUniversities.push({
          university: all_universities[u].name,
          users: usersByUniversity,
        });
      }
    } catch (e) {
      console.log(e);
    }

    res.render("pages/admin/dashboardUniversity", {
      user: req.user,
      user_count: users.length,
      usersByUniversities,
    });
  } else {
    res.redirect("/");
  }
};

module.exports = adminCtrl;
