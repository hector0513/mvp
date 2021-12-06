const moment = require("moment");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const { transporter } = require("../utilities");

const { User } = require("../models/user");
const { Country } = require("../models/country");
const { University } = require("../models/university");
const { Career } = require("../models/career");
const { Category } = require("../models/category");
const { Requirement } = require("../models/requirement");
const { Proposal } = require("../models/proposal");
const { Referred } = require("../models/referred");
const { Wallet } = require("../models/wallet");
const { Chat } = require("../models/chat");
const { ToDo } = require("../models/todo");
const { Notice } = require("../models/notice");
const partnerCtrl = {};

partnerCtrl.categoriesPost = async (req, res) => {
  if (!req.body.categories) req.body.categories = []
  try {
    var user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { "workInfo.categories": req.body.categories } },
      { new: true }
    );
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error");
  }
};

/**
 * Redirects the user to its proper profile
 * @param {string} requirement - the requirement ID.
 * @param {string} description - the task description.
 * @param {string} priority - the task priority (0:low, 1:medium, 2:high).
 * @param {date} deadline - deadline of the task.
 * @param {array} tags - list of tags.
 * @param {string} partner - the user ID.
 * @return {string} - Request message and status
 */

partnerCtrl.getHome = async (req, res) => {
  var opportunities = [];
  var opportunities_rejected = [];
  if (req.user.worker) return res.redirect("/client");

  console.log(req.user._id);
  try {

    if (req.user.workInfo && req.user.workInfo.categories) {
      var all_categories = req.user.workInfo.categories;

      for (var a = 0; a < all_categories.length; a++) {
        var requirementCat = await Requirement.find({
          subcategory: all_categories[a].categoryID,
          rejected: { $ne: req.user._id } //,
          // private: { $ne: req.user._id },
        })
          .populate("subcategory client")
          .sort({ _id: -1 });

          for (var rs = 0; rs< requirementCat.length; rs++){
            if (requirementCat[rs].private) {
              if (String(requirementCat[rs].private) == String(req.user._id)){
                opportunities.push(requirementCat[rs])
              }
            } else {
              opportunities.push(requirementCat[rs])
            }
          }

        // non-rejected opportunities
        //opportunities = opportunities.concat(requirementCat);

        var requirementRej = await Requirement.find({
          subcategory: all_categories[a].categoryID,
          rejected: req.user._id,
        })
          .populate("subcategory client")
          .sort({ _id: -1 });

        opportunities_rejected = opportunities_rejected.concat(requirementRej);
      }

      opportunities_rejected.forEach((op, o) => {
        op.status = "Cancelado";
      });

      opportunities = opportunities.concat(opportunities_rejected);
      // var privateRequirements = await Requirement.find({
      //   private: req.user._id
      // }).populate("subcategory client")
      // .sort({ _id: -1 });
      //
      // opportunities = opportunities.concat(privateRequirements);

    }

    var previousReq = await Requirement.find({
      "partner": req.user._id, rejected: {$ne:req.user._id}})
      .populate("subcategory client")
      .sort({ _id: -1 });

      var previousReqRejected = await Requirement.find({
        rejected: req.user._id
      })
        .populate("subcategory client")
        .sort({ _id: -1 });

      previousReq = previousReq.concat(previousReqRejected);

      for (var pr=0; pr<previousReq.length; pr++) {
        var o_found = opportunities.find(o => String(o._id) == String(previousReq[pr]._id));
        if (!o_found){
          opportunities.push(previousReq[pr]);
        }
      }

  } catch (e) {
    console.log(e);
    console.log("Error cargando las categorias del usuario");
  }

  try {
    var referreds = await Referred.find(
      { user_referrer: req.user._id },
      "referred"
    ).distinct("referred");

    if (referreds) var invitedUsers = await User.find({ email: referreds });
  } catch (e) {
    console.log(e);
    console.log("Error cargando los referidos del usuario");
  }

  var value = 0;

  var wallet = await Wallet.find({ user: req.user });

  var week = ["D", "L", "M", "M", "J", "V", "S"];
  var opp = await Requirement.find({
    partner: req.user._id,
    status: "Iniciado",
  }).populate("subcategory client partner proposal");
  var calendar = [];
  for (var w = 0; w < 7; w++) {
    var current_date = new Date();
    var next_date = new Date(current_date.setDate(current_date.getDate() + w));
    var task = opp.find(
      (r) =>
        moment(r.proposal.deadline).format("DD/MM/YYYY") ==
        moment(next_date).format("DD/MM/YYYY")
    );
    calendar.push({
      weekday: week[next_date.getDay()],
      date: next_date.getDate(),
      current: next_date,
      task: task,
    });
  }
  var checkTodo = req.query.check == "todo" || false;
  var checkNotice = req.query.check == "service" || false;
  var todo = await ToDo.find({
    partner: req.user._id,
    status: "Pending",
  }).sort({ order: 1, deadline: 1, priority: -1 }); //.sort({deadline: 1});

  var realTime = new Date();
  for (var t = 0; t < todo.length; t++) {
    if (todo[t].deadline < realTime) {
      // task already expired
      await ToDo.findOneAndUpdate(
        { _id: todo[t]._id },
        { $set: { status: "Expired", completed: todo[t].deadline } },
        { new: true }
      );
      todo.splice(t, 1);
    }
  }
  var done = await ToDo.find({
    partner: req.user._id,
    status: { $ne: "Pending" },
  }).sort({ completed: -1 });

  var notices = await Notice.find({ partner: req.user._id }).sort({
    timeStampCreate: -1,
  });

  var chats =[];
  for (var n=0; n<notices.length; n++){
    var chat = await Chat.find({notice: notices[n]._id}).populate("client notice");
    chats = chats.concat(chat);
    notices[n]["chats"] = chat;

    // requirements per notice
    var req_per_notice = await Requirement.find({notice: notices[n]._id})
    notices[n]["req_per_notice"] = req_per_notice.length;

    // requirements accepted per notice
    var req_accepted_per_notice = await Requirement.find({notice: notices[n]._id, status: "Iniciado"});
    notices[n]["req_accepted_per_notice"] = req_accepted_per_notice.length;
  }

  var canCreateNotice = true;

  if (!req.user.rank) await User.findOneAndUpdate({_id:req.user._id},{$set: {rank: "bronze"}});

  if (req.user.rank == "bronze" ){
    if (notices.length >= 4){
      canCreateNotice = false;
    }
  } else if (req.user.rank == "silver" ){
    if (notices.length >= 10){
      canCreateNotice = false;
    }
  } else if (req.user.rank == "gold" ){
    if (notices.length >= 30){
      canCreateNotice = false;
    }
  }

  var categories = await Category.find();

  var calendarWidget = []

  opp.forEach((item, i) => {
    calendarWidget.push(

      {
        title: item.name,
        start: moment(item.proposal.deadline).format("YYYY-MM-DD"),
        url: "/partner/opportunity/inProgress/"+item._id
      }
    )
  });


  todo.forEach((item, i) => {
    calendarWidget.push(
      {
        title: item.description,
        start: new Date(new Date(item.deadline).getTime() - 24*60*60*1000),
        url: "/partner?check=todo"
      }
    )
  });

  res.render("pages/partners/homecopia", {
    user: req.user,
    value, // seria el valor del nivel del usuario o algo asi
    opportunities,
    invitedUsers,
    wallet,
    calendar,
    chats,
    todo,
    done,
    calendarWidget,
    moment,
    checkNotice,
    checkTodo,
    notices,
    categories,
    canCreateNotice
  });
};

/**
 * Render the balance chart based on the wallet
 */
partnerCtrl.getProfile = async (req, res) => {
  if (req.user.worker) return res.redirect("/client");

  var countries = await Country.find({}, "name").distinct("name");

  var vene = ["Venezuela"];
  countries = vene.concat(countries);

  var category = await Category.find({}, "category")
    .sort({ name: 1 })
    .distinct("category");

  // Para el cumpleaños del usuario
  var birthday = moment(req.user.dob).add(1, "day").format("yyyy-MM-DD");
  var categories = await Category.find().sort({ name: 1 });
  var value = 0;
  res.render("pages/partners/profile", {
    user: req.user,
    birthday,
    value,
    countries,
    categories,
    category,
  });
};

/**
 * Release money using a wireTransfer petition
 * @param {string} firstname - Client firstname.
 * @param {string} lastname - Client lastname.
 * @param {string} userId - User ID.
 * @param {date} dob - Birth date.
 * @param {string} bornCountry - Country.
 * @param {string} livingCity - City.
 * @param {string} studyCountry - Study country.
 * @param {string} institution - Name of institution.
 * @param {string} career - Career.
 * @param {string} specialty - Specialty.
 * @param {string} yearsExp - Years of experience.
 * @param {string} workCategory - Work category.
 * @param {string} workSub - Work subcategory.
 * @return {string} Operation message status
 */
partnerCtrl.updateInfo = async (req, res) => {
  try {
    var user = await User.findById(req.user._id);

    if (!user)
      return res
        .status(404)
        .send("No se encontró el usuario que se quiere actualizar");

    const form = formidable();

    form.uploadDir = "src/assets/uploads/users";
    form.keepExtensions = true;

    form.parse(req, async function (err, fields, files) {
      //personal info
      user.firstname = fields.firstname;
      user.lastname = fields.lastname;
      user.userId = fields.userId;
      user.dob = fields.dob;
      user.country = fields.bornCountry;
      user.city = fields.livingCity;
      //studyInfo
      user.studyInfo.studyCountry = fields.studyCountry;
      user.studyInfo.institution = fields.institution;
      user.studyInfo.career = fields.career;
      user.studyInfo.specialty = fields.specialty;
      //workInfo
      user.workInfo.yearsExp = fields.yearsExp;
      user.workInfo.workCategory = fields.workCategory;
      user.workInfo.workSub = fields.workSub;
      if (files.resume.size > 0) {
        user.workInfo.fileOfName = files.resume.name;
      }

      try {
        // si tiene archivo nuevo, elimina el previo y cambia el path
        if (files.profPic.size > 0) {
          // si es distinto a la foto por defecto la elimina del servidor
          if (user.photo != "/assets/images/user.png") {
            var old_photo = "src/" + user.photo;
            fs.unlink(old_photo, function () {
              console.log("deleted previous photo " + old_photo);
            });
          }

          user.photo =
            "/assets/uploads/users/" + path.basename(files.profPic.path);
        } else {
          fs.unlink(files.profPic.path, function () {
            console.log("deleted temp photo " + files.profPic.path);
          });
        }
      } catch (e) {
        console.log(e);
        return res.status(500).send("Error actualizando la foto de perfil");
      }

      try {
        // si tiene archivo nuevo, elimina el previo y cambia el path
        if (files.resume.size > 0) {
          if (user.workInfo.resume)
            fs.unlink("src/" + user.workInfo.resume, function () {
              console.log("deleted previous cv src/" + user.workInfo.resume);
            });

          user.workInfo.resume =
            "/assets/uploads/users/" + path.basename(files.resume.path);
        } else {
          fs.unlink(files.resume.path, function () {
            console.log("deleted temp cv " + files.resume.path);
          });
        }
      } catch (e) {
        console.log(e);
        return res.status(500).send("Error actualizando el CV del usuario");
      }

      await user.save();
    });

    form.on("error", function (err) {
      console.log(err);
      res.status(500).send("Error leyendo el form");
    });

    form.on("end", function () {
      console.log("done!");
      res.redirect("/partner/profile");
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error leyendo el form de usuario");
  }
};

/**
 * Invites a user into the platform
 * @param {string} email - the potential user email.
 * @return {string} - Message of the operation
 */
partnerCtrl.inviteUser = async (req, res) => {
  try {
    // Busca si este usuario ya está registrado
    var user = await User.findOne({ email: req.body.email });

    // Si lo encuentra, retorna que ya existe (409 - conflict)
    if (user) {
      console.log("el usario ya existe");
      return res.send({
        message: "¡Este usuario ya está registrado en Asilinks!",
      });
    } else {
      // Get user token to send
      var compiled = ejs.compile(
        fs.readFileSync(
          __dirname + "/../views/email_templates/refers_mailling.ejs",
          "utf-8"
        )
      );
      var html = compiled({
        headers: req.headers.host,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
      });

      var mailOptions = {
        from: "Asilinks <admin@asilinks.com>",
        to: req.body.email, // list of receivers
        subject: "Únete a la comunidad Asilinks!", // Subject line
        html: html,
      };

      // Send Email
      await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error);
          var alert_message = "Ocurrió un error invitando a tu compañero!";
          return res.send({
            message: "¡Ocurrió un error invitando a tu compañero!",
          });
        } else {
          console.log("Email enviado: " + info.response);

          try {
            var ref_user = new Referred();

            ref_user.referred = req.body.email;
            ref_user.user_referrer = req.user._id;

            await ref_user.save();
            return res.send({
              message: "¡Invitación enviada! Esperamos verlo pronto por aquí!",
            });
          } catch (e) {
            console.log("Error agregando el referido a BD", e);
            return res.send({ message: "¡Error agregando el referido a BD" });
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
    return res.send({ message: "Error al procesar" });
  }
};

/**
 * Get university list
 * @param {string} studyCountry - university country.
 * @return {university} - Object type university
 */
partnerCtrl.getUniversities = async (req, res) => {
  try {
    var country = await Country.findOne({
      name: req.params.studyCountry,
    }).sort({ name: 1 });
    var uni = await University.find({ country: country._id }).sort({ name: 1 });

    res.send(uni);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

/**
 * Get career list
 * @param {string} uni - university.
 * @return {career} - Object type career
 */
partnerCtrl.getCareers = async (req, res) => {
  try {
    var career = await Career.find({ university: req.params.uni }).sort({
      career: 1,
    });

    res.send(career);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

/**
 * Get the requirement description for possible proposals
 * @param {string} id - the requirement ID
 */
partnerCtrl.seeRequirement = async (req, res) => {
  try {
    var proposal;

    var opportunity = await Requirement.findById(req.params.id).populate(
      "client subcategory"
    );
    proposal = await Proposal.findOne({
      requirement: req.params.id,
      partner: req.user._id,
      status: { $ne: "Rejected" },
    });
    if (proposal) {
      if (proposal.status == "Accepted")
        return res.redirect(
          "/partner/opportunity/inProgress/" + opportunity._id
        );
    }
    res.render("pages/partners/opportunity", {
      user: req.user,
      opportunity,
      proposal,
      value: 0,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

/**
 * Get the in progress requirement
 * @param {string} id - the requirement ID
 */
partnerCtrl.progressRequirement = async (req, res) => {
  try {
    var requirement = await Requirement.findById(req.params.id).populate(
      "proposal"
    );
    // var proposal = await Proposal.find({requirement:req.query.id, status: {$ne: "Rejected"}}).populate('partner');
    var client = await User.findById(requirement.client);
    var partner = await User.findById(requirement.partner);
    var chats = await Chat.findOne({ requirement: req.params.id });
    var chat = [];
    if (chats) chat = chats.chat;

    //calc extension
    var extensionDate;
    var requestExtension = false;
    var newDeadline = requirement.proposal.estimatedTime;

    if (!requirement.proposal.extension.requested) {
      // no extension yet
      var a = requirement.proposal.acceptedTime.getTime();
      var d = requirement.proposal.deadline.getTime();
      var t = (d - a) / 2;
      var c = new Date().getTime();
      var max = a + t;
      if (c <= max) {
        // less or equal to 50% of estimated time
        // new deadline
        requestExtension = true;
        extensionDate = new Date(c + t);
        newDeadline = Number(
          (requirement.proposal.estimatedTime / 2).toFixed(0)
        );
      }
    }

    if (String(req.user._id) != String(partner._id)) {
      console.log("este usuario no es el partneer");
      return res.redirect("/partner");
    } else {
      var value = 0;

      var check_services;
      var html_services;
      var done = false;

      if (requirement.status == "Finalizado" && requirement.paymentDone) {
        check_services = ejs.compile(
          fs.readFileSync(
            __dirname + "/../views/email_templates/check.ejs",
            "utf-8"
          )
        );
        html_services = check_services({
          date: moment(requirement.paymentDate).format("DD/MM/YYYY"),
          time: moment(requirement.paymentDate).format("hh:mm a"),
          to:
            req.user.firstname +
            "" +
            req.user.lastname +
            " por concepto de: Servicios profesionales",
          amount: Number(requirement.proposal.price.toFixed(2)),
          paymentType: "Wallet",
        });
        done = true;
        if (client.lastLogin)
          client.lastLogin = moment(client.lastLogin).format(
            "DD/MM/YYYY hh:mm a"
          );
        if (partner.lastLogin)
          partner.lastLogin = moment(partner.lastLogin).format(
            "DD/MM/YYYY hh:mm a"
          );
      }

      var isRated = false;
      if (client.rating.length > 0) {
        var rate_client = client.rating.find(
          (r) => String(r.requirement) == String(requirement._id)
        );
        if (rate_client) isRated = true;
      }

      res.render("pages/partners/requirement-inProgress", {
        user: req.user,
        requirement,
        newDeadline,
        cliente: client, //client is a EJS reserved key
        partner,
        moment: moment,
        value,
        requestExtension,
        chat,
        html_services,
        done,
        isRated,
      });
    }
  } catch (e) {
    console.log(e);
    res.redirect("/partner");
  }
};

/**
 * Render the view with all wallet transactions
 */
partnerCtrl.getWallet = async (req, res) => {
  if (req.user.worker) return res.redirect("/client");

  var value = 0;

  var wallet = await Wallet.find({ user: req.user._id });
  res.render("pages/partners/wallet", {
    user: req.user,
    value, // seria el valor del nivel del usuario o algo asi
    wallet,
    moment,
  });
};

/**
 * Rate a partner once a requirement is completed
 * @param {string} requirement - the requirement ID.
 * @param {string} rate - The rating from very bad to very good.
 * @param {string} comment - a comment of performance.
 */
partnerCtrl.rateClient = async (req, res) => {
  try {
    var rate = {
      requirement: req.body.requirement,
      performance: req.body.rate,
      partner: req.user._id,
      comment: req.body.comment,
    };
    var client = await User.findOneAndUpdate(
      { _id: req.params.client },
      { $push: { rating: rate } },
      { new: true }
    );
    res.redirect("/partner/opportunity/inProgress/" + req.body.requirement);
  } catch (e) {
    console.log(e);
    res.redirect("/partner");
  }
};

/**
 * Creates a To-Do list task
 * @param {string} requirement - the requirement ID.
 * @param {string} description - the task description.
 * @param {string} priority - the task priority (0:low, 1:medium, 2:high).
 * @param {date} deadline - deadline of the task.
 * @param {array} tags - list of tags.
 * @param {string} partner - the user ID.
 * @return {string} - Request message and status
 */
partnerCtrl.createTask = async (req, res) => {
  try {
    var todo = new ToDo();
    var partner = await User.findById(req.body.partner);
    todo.description = req.body.description;
    if (req.body.requirement != "undefined")
      todo.requirement = req.body.requirement;
    todo.priority = req.body.priority;
    todo.timeStampCreate = new Date();
    var date = new Date(req.body.deadline);
    var offset = date.getTimezoneOffset() / 60;
    var formated_deadline = new Date(date.setHours(date.getHours() + offset));
    formated_deadline = new Date(
      formated_deadline.getTime() + 24 * 60 * 60 * 1000
    );
    todo.deadline = formated_deadline;
    todo.tags = req.body.tags;
    todo.partner = req.body.partner;
    var newTodo = await todo.save();

    var previousDay = new Date(
      formated_deadline.getTime() - 24 * 60 * 60 * 1000
    );
    var currentDate = new Date();

    var notificationTime = previousDay.getTime() - currentDate.getTime();
    setTimeout(
      emailTask,
      notificationTime,
      req.body.description,
      partner,
      newTodo._id
    );

    var expireTime = formated_deadline.getTime() - currentDate.getTime();
    setTimeout(expireTask, expireTime, newTodo);

    return res.status(200).send(newTodo);
  } catch (e) {
    console.log(e);
    return res.status(500).send("error creating the task");
  }
};

/**
 * Edits a To-Do list task
 * @param {string} requirement - the requirement ID.
 * @param {string} description - the task description.
 * @param {string} priority - the task priority (0:low, 1:medium, 2:high).
 * @param {date} deadline - deadline of the task.
 * @param {array} tags - list of tags.
 * @param {string} partner - the user ID.
 * @param {string} task - the task ID.
 * @return {string} - Request message and status
 */
partnerCtrl.editTask = async (req, res) => {
  try {
    var todo = await ToDo.findById(req.body.task);
    todo.description = req.body.description;
    if (req.body.requirement != "undefined") {
      todo.requirement = req.body.requirement;
    } else {
      todo.requirement = undefined;
    }

    todo.priority = req.body.priority;
    var date = new Date(req.body.deadline);
    var offset = date.getTimezoneOffset() / 60;
    var formated_deadline = new Date(date.setHours(date.getHours() + offset));
    todo.deadline = formated_deadline;
    todo.tags = req.body.tags;
    var newTodo = await todo.save();
    return res.status(200).send(newTodo);
  } catch (e) {
    console.log(e);
    return res.status(500).send("error creating the task");
  }
};

/**
 * Delete a To-Do list task
 * @param {string} task - the task ID.
 * @return {string} - Request message and status
 */
partnerCtrl.deleteTask = async (req, res) => {
  try {
    var todo = await ToDo.findOneAndRemove({ _id: req.body.task });
    return res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    return res.status(500).send("error creating the task");
  }
};

/**
 * Checks a task as completed
 * @param {string} task - the task ID.
 * @return {string} - Request message and status
 */
partnerCtrl.checkTask = async (req, res) => {
  try {
    var todo = await ToDo.findOneAndUpdate(
      { _id: req.body.task },
      { $set: { status: "Done", completed: new Date() } },
      { new: true }
    );
    return res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    return res.status(500).send("error processing the task");
  }
};

/**
 * Sort TODO List
 * @param {string} list - the task ID.
 * @return {string} - Request message and status
 */
partnerCtrl.sortList = async (req, res) => {
  try {
    var todo = req.body.list;
    todo.forEach(async (item, i) => {
      var task = await ToDo.findOneAndUpdate(
        { _id: item },
        { $set: { order: i } },
        { new: true }
      );
    });

    return res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    return res.status(500).send("error processing the task");
  }
};

/**
 * Find a task by query
 * @param {string} search - the query.
 * @param {string} partner - the partner ID.
 * @return {string} - Request message and status
 */
partnerCtrl.searchTask = async (req, res) => {
  try {
    var search = req.body.search;
    var todo = await ToDo.find({
      partner: req.body.partner,
      $or: [{ description: { $regex: search } }, { tags: { $regex: search } }],
    });
    return res.status(200).send(todo);
  } catch (e) {
    console.log(e);
    return res.status(500).send("error processing the task");
  }
};

partnerCtrl.listNotice = async (req, res) => {
  var notices = [];
  try {
    notices = await Notice.find({ partner: req.user._id }).sort({
      timeStampCreate: -1,
    });
  } catch (e) {
    console.log(e);
  }
  res.render("pages/partners/notice", {
    user: req.user,
    value: 0,
    moment,
    notices,
  });
};

partnerCtrl.createNotice = async (req, res) => {
  try {
    var newNotice = new Notice();
    newNotice.partner = req.user._id;
    newNotice.description = req.body.description;
    newNotice.timeStampCreate = new Date();
    newNotice.name = req.body.name;
    newNotice.price = req.body.price;
    newNotice.estimatedUnit = req.body.estimatedUnit;
    newNotice.estimatedTime = req.body.estimatedTime;
    newNotice.categories = req.body.categories;

    // notify users
    var clients = [];
    var categories = req.body.categories;

    for(var c=0; c<categories.length;c++){
      var client = await User.find({"interest.categoryID": categories[c].categoryID});
      clients = clients.concat(client);
    }
      // unique clients
      var unique_clients = []
      var uniques = clients.filter((clients, index, self) =>
          index === self.findIndex((c) => (String(c._id) == String(clients._id) && String(c._id) == String(clients._id))))

      uniques.forEach((item, i) => {
        unique_clients.push(item._id)
      });

      if (req.user.rank == "bronze") {
        newNotice.clients = unique_clients.slice(0,30);
      } else if (req.user.rank == "silver") {
        newNotice.clients = unique_clients.slice(0,150);
      } else if (req.user.rank == "gold") {
        newNotice.clients = unique_clients.slice(0,250);
      }

    var service = await newNotice.save();

    for (var u=0; u<uniques.length; u++){

      // send email
      var href = req.headers.host+"/client/service/"+service._id+"/"+uniques[u]._id;
      var html = "<html><body><p>Hola, el socio "+req.user.firstname+" "+req.user.lastname
                + " ha enviado una propuesta que puede interesarte:\n"
                + "<br><br>Nombre: "+req.body.name+ "<br>Descripción: "+ req.body.description
                + "<br> Tiempo estimado: "+ req.body.estimatedTime +" "+req.body.estimatedUnit
                + "<br> Precio estimado: $"+ req.body.price
                + "<br><br>Puedes interactuar con esta propuesta en el este <a href='"+href+"'>enlace</a>."
                + "</p></body></html>";

      var mailOptions = {
      from: 'Asilinks <admin@asilinks.com>',
      to: uniques[u].email, // list of receivers
      subject: 'Tienes una propuesta de servicio', // Subject line
      html: html
      };

      // Send Email
      await transporter.sendMail(mailOptions, async function(error, info){
        if(error){
          console.log(error);
        }else{
          console.log('Email enviado: ' + info.response);
        }
      });
    }
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error al crear propuesta");
  }
};

partnerCtrl.editNotice = async (req, res) => {
  try {

    //
    var notice = await Notice.findOneAndUpdate(
      { _id: req.body.id },
      { $set: {
        name: req.body.name,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        estimatedUnit: req.body.estimatedUnit,
        categories: req.body.categories,
        price: req.body.price,
      } },
      { new: true }
    );
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error al editar propuesta");
  }
};

partnerCtrl.deleteNotice = async (req, res) => {
  try {
    var notice = await Notice.findOneAndRemove({ _id: req.body.id });
    res.send("ok");
  } catch (e) {
    console.log(e);
    res.send("error al eliminar propuesta");
  }
};

async function emailTask(description, partner, id) {
  var task = await ToDo.findById(id);
  if (task.status == "Pending") {
    try {
      var mailOptions = {
        from: "Asilinks <admin@asilinks.com>",
        to: partner.email, // list of receivers
        subject: "Tienes una tarea a punto de vencerse", // Subject line
        html:
          "<html><body>La tarea " +
          description +
          ' se vencerá mañana.<br><a href="http://' +
          `${process.env.HOST}` +
          '/partner?check=todo">Pulsa aquí para verla</a></body></html>',
      };
      // Send Email
      await transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error);
        } else {
          await ToDo.findOneAndUpdate(
            { _id: id },
            { $set: { notified: true } }
          );
          console.log(info);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
}

async function expireTask(newTodo) {
  var task = await ToDo.findById(newTodo._id);
  if (task.status == "Pending")
    await ToDo.findOneAndUpdate(
      { _id: newTodo._id },
      { $set: { status: "Expired", completed: newTodo.deadline } }
    );
}

async function timeOutTask() {
  console.log("calculando los tiemouts");
  try {
    var currentDate = new Date();
    var tasks = await ToDo.find({ status: "Pending" }).populate("partner");

    tasks.forEach((item, i) => {
      var deadline = new Date(item.deadline);
      var previousDay = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);

      if (!item.notified) {
        var notificationTime = previousDay.getTime() - currentDate.getTime();
        setTimeout(
          emailTask,
          notificationTime,
          item.description,
          item.partner,
          item._id
        );
      }

      var expirationTime = deadline.getTime() - currentDate.getTime();
      setTimeout(expireTask, expirationTime, item);
    });
  } catch (e) {
    console.log(e);
  }
}
/**
 * Rate a partner once a requirement is completed
 * @param {string} requirement - the requirement ID.
 * @param {string} rate - The rating from very bad to very good.
 * @param {string} comment - a comment of performance.
 */
partnerCtrl.noticeChat = async (req, res) =>{

  try {
    var notice = await Notice.findById(req.params.notice).populate("partner");
    var chat = await Chat.findOne({notice: notice._id, client: req.params.client});
    var cliente = await User.findById(req.params.client);
    var requirement = await Requirement.find({notice:notice._id, client: cliente._id});

    if (String(notice.partner._id) == String(req.user._id)) {
      res.render('pages/partners/notice-chat',
        {
          user: req.user,
          notice,
          chat,
          cliente,
          requirement,
          value:0,
          moment: moment
        });
    } else if (String(cliente._id) == String(req.user._id)){
      res.redirect("/client/service/"+notice._id+"/"+cliente._id);
    } else {
      res.redirect("/partner/");
    }
  } catch (e){
    console.log(e);
    res.redirect("/partner")
  }
}
timeOutTask();

module.exports = partnerCtrl;
