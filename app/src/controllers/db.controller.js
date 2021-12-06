const express = require('express');
const fs = require('fs')
const router = express.Router();
var { Country } = require('../models/country')
var { Category } = require('../models/category')
var { University } = require('../models/university')
var { Career } = require('../models/career')
var { UniPetition } = require('../models/uniPetition')

const dbCtrl = {};
/**
 * Loads JSON Country into the DB
 * @return {string} Message and status
 */
dbCtrl.loadCountries = (req, res) => {
  console.log('countries loaded');

  var countries = __dirname + '/../../countries.json'
  fs.readFile(countries, 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return res.send("Error cargando json countries")
    }
    try {
      countries = JSON.parse(jsonString)
      for (var i = 0; i < countries.length; i++){

        var country = new Country();
        country.name = countries[i].name;

        country.iso_code = countries[i].code;

        country.save()
      }
    } catch (e){
      console.log(e)
      return res.send("Error leyendo json countries2")
    }
    res.sendStatus(200);
  })
}


/**
 * Loads JSON Categories into the DB
 * @return {string} Message and status
 */
dbCtrl.loadCategories = (req, res) => {
  console.log('categories loaded');
  var categories = __dirname + '/../../know_fields.json'


  fs.readFile(categories, 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return res.send("Error cargando json categories")
    }
    try {

      categories = JSON.parse(jsonString)
      for (var i = 0; i < categories.length; i++){

        var category = new Category();

        category.about = categories[i].about;
        category.category = categories[i].category;
        category.sub_category = categories[i].sub_category;
        category.enable = categories[i].enable;

        category.save()

      }

    } catch (e){

      console.log(e)
      return res.send("Error leyendo json categories2")

    }

    res.sendStatus(200);
  })
};


/**
 * Loads JSON Categories into the DB
 * @return {string} Message and status
 */
dbCtrl.loadCategoriesFull = (req, res) => {

  var categories = __dirname + '/../../categories.json'


  fs.readFile(categories, 'utf8', async (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return res.send("Error cargando json categories")
    }
    try {

      categories = JSON.parse(jsonString)

      for (var i = 0; i < categories.length; i++){


        for (var j = 0; j < categories[i].subs.length; j++){
          var about = categories[i].desc;
          if (categories[i].subs[j].desc){
            about = categories[i].subs[j].desc;
          }
          var existent = await Category.findOne({"sub_category":categories[i].subs[j].sub , "category": categories[i].cat});
          if (existent) {
            var update = {"about": about}
            if (categories[i].subs[j].hab){
              update["habilities"] = categories[i].subs[j].hab;
            }
            await Category.findOneAndUpdate({"sub_category":categories[i].subs[j].sub , "category": categories[i].cat},
                                            {$set: update});
          } else {

            var category = new Category();
            category.about = about;
            category.category = categories[i].cat;
            category.sub_category = categories[i].subs[j].sub;
            category.enable = categories[i].enable;
            if (categories[i].subs[j].hab){
              category.habilities = categories[i].subs[j].hab;
            }
            await category.save()
          }
        }
      }

    } catch (e){

      console.log(e)
      return res.send("Error leyendo json categories2")

    }

    res.sendStatus(200);
  })
};

/**
 * Loads JSON universities into the DB
 * @return {string} Message and status
 */
dbCtrl.loadUni =  (req, res) => {
  console.log('unis loaded');

  var universities = __dirname + '/../../uni.json'
  fs.readFile(universities, 'utf8', async (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return res.send("Error cargando json uni")
    }
    try {

      universities = JSON.parse(jsonString)

      for (var i = 0; i < universities.length; i++){

        var uni = new University();

        uni.name = universities[i].name;
        uni.shortname = universities[i].shortname;
        var country = await Country.findOne({ name: universities[i].country})

        uni.country = country._id;
        uni.save()

      }

    } catch (e){

      console.log(e)
      return res.send("Error leyendo json uni2")

    }
    res.sendStatus(200);
  })

};


/**
 * Loads JSON Career into the DB
 */
dbCtrl.loadCareer =  (req, res) => {
  console.log('careers loaded');

  var categories = __dirname + '/../../career.json'
  fs.readFile(categories, 'utf8', async (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return res.send("Error cargando json career")
    }
    try {

      categories = JSON.parse(jsonString)

      for (var i = 0; i < categories.length; i++){

        var career = new Career();

        career.university = categories[i].university;
        career.career = categories[i].career;
        var universities = await University.findOne({ name: categories[i].university})
        career.university_id = universities._id;
        career.save()
      }
    } catch (e){
      console.log(e)
      return res.send("Error leyendo json career2")
    }
    res.sendStatus(200);

  })
};


/**
 * Adds new university, career or work category Petition
 * @param {string} add_university - the type of petition
 * @param {string} university_name - name of the university.
 * @param {string} university_country - country of the univeristy.
 * @param {string} university_career - career.
 * @param {string} work_category - work category.
 * @param {string} work_subcategory - work subcategory.
 * @return {string} Message and status
 */
dbCtrl.addUniversity =  (req, res) => {

  try {

    var newUni = new UniPetition();

    newUni.category = req.body.add_university

    if (req.body.add_university == "Universidad"){

      newUni.university_name = req.body.university_name
      newUni.university_country = req.body.university_country

    } else if (req.body.add_university == "Carrera") {

      newUni.university_name = req.body.university_name
      newUni.university_country = req.body.university_country
      newUni.university_career = req.body.university_career

    } else if (req.body.add_university == "Categoría Laboral"){
      newUni.work_category = req.body.work_category
      newUni.work_subcategory = req.body.work_subcategory
    }
    newUni.user = req.user._id
    newUni.save();
    res.status(200).send("si")
  } catch (e){
    console.log(e)
    res.status(500).send("Error guardando el usuario")
  }
};


module.exports = dbCtrl;
