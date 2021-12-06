const moment = require('moment');
const { Chat } = require('./models/chat')
const { User } = require('./models/user')
const { Requirement } = require('./models/requirement')

module.exports = (app) => {
  let activeStreams = {} // contains the stream list. Key: stream id, Value: { messages }

  const io = require('socket.io')(app, {
      handlePreflightRequest: (req, res) => {
          const headers = {
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
              "Access-Control-Allow-Credentials": true
          };
          res.writeHead(200, headers);
          res.end();
      }
  });

var requirements = []
var notices = []

  io.on("connection", socket => {

    socket.on("disconnect", async _ => {
      console.log("disconnected " + socket.id )
      // as client
      let requirement_as_client = requirements.filter(r => r.client == socket.id);
      for (let r_c=0; r_c<requirement_as_client.length; r_c++){

        socket.to(requirement_as_client[r_c].partner).emit("chat_disconnect",{
          lastLogin: moment().format("DD/MM/YYYY hh:mm a")
        })
      }
      if (requirement_as_client.length>0){
        var requirement = await Requirement.findOne({_id: requirement_as_client[0].requirement}).populate("proposal")
        await User.findOneAndUpdate({_id: requirement.client}, {$set: {lastLogin: new Date()} }, {new: true})
      }

      let notice_as_client = notices.filter(r => r.client == socket.id);
      for (let n_c=0; n_c<notice_as_client.length; n_c++){

        socket.to(notice_as_client[n_c].partner).emit("chat_disconnect",{
          lastLogin: new Date()
        })
        await User.findOneAndUpdate({_id: notice_as_client[n_c].clientID}, {$set: {lastLogin: new Date()} }, {new: true})
      }

      // as partner
      let requirement_as_partner = requirements.filter(r => r.partner == socket.id);
      for (let r_p=0; r_p<requirement_as_partner.length; r_p++){

        socket.to(requirement_as_partner[r_p].client).emit("chat_disconnect",{
          lastLogin: moment().format("DD/MM/YYYY hh:mm a")
        })
      }

      if (requirement_as_partner.length>0){
        var requirement = await Requirement.findOne({_id: requirement_as_partner[0].requirement}).populate("proposal")
        await User.findOneAndUpdate({_id: requirement.proposal.partner}, {$set: {lastLogin: new Date()} }, {new: true})
      }

      let notice_as_partner = notices.filter(r => r.partner == socket.id);
      for (let n_p=0; n_p<notice_as_partner.length; n_p++){

        socket.to(notice_as_partner[n_p].client).emit("chat_disconnect",{
          lastLogin: new Date()
        })
        await User.findOneAndUpdate({_id: notice_as_partner[n_p].partnerID}, {$set: {lastLogin: new Date()} }, {new: true})
      }


      if (socket.id in activeStreams) {
        delete activeStreams[socket.id]
        socket.broadcast.emit("streaming-list", Object.keys(activeStreams))
      }
    })

    // socket to manage the private chat
    socket.on("private-message", async (data) => {

      var user_emit;

      // find a requirement and save the partner and cliente socket ID
      let requirement = requirements.find(r => r.requirement == data.requirement);

      if (requirement){
        if (data.isPartner){
          user_emit = requirement.client
          requirement.partner = data.id;
        } else {

          user_emit = requirement.partner
          requirement.client = data.id;
        }
      } else {
        requirement = {requirement: data.requirement,client:'',partner:''};
        if (data.isPartner){

          user_emit = requirement.client
          requirement.partner = data.id;
        } else {

          user_emit = requirement.partner
          requirement.client = data.id;
        }
        requirements.push(requirement)
      }

      var chat;
      var time = moment().format("hh:mm a")
      if (data.message !=""){
        try {
          if (data.requirement) {
              chat = await Chat.findOne({"requirement":data.requirement})
              if (chat){
                // find the respective chat and update
                await Chat.findOneAndUpdate(
                  {"requirement":data.requirement},
                {
                  $push: {chat: {message: data.message, time: time, user: data.user}}
                }, {new: true})

              } else {

                // create a new chat
                var newChat = new Chat();
                newChat.requirement = data.requirement;
                newChat.chat = [{message: data.message, time: time, user: data.user}]
                await newChat.save();
              }
          }

        } catch (e){
          console.log(e);
        }
      }

        socket.emit("private-message", {
          id: data.id, //client or partner
          message: data.message,
          time: time,
          requirement: data.requirement,
          me: true
        }) // Message to self for confirmation

        socket.to(user_emit).emit("private-message", {
          id: socket.id, //partner or client
          message: data.message,
          time: time,
          requirement: data.requirement,
          lastLogin: "Online"
        })

    })

    // socket to manage the private chat
    socket.on("private-message-notice", async (data) => {

      var user_emit;

      // find a requirement and save the partner and cliente socket ID
      let notice = notices.find(r => (r.notice == data.notice && r.clientID == data.cliente) );

      if (notice){
        if (data.isPartner){
          user_emit = notice.client
          notice.partner = data.id;
          notice.partnerID = data.user;
        } else {
          user_emit = notice.partner
          notice.client = data.id;
          // notice.clientID = data.user;
        }
      } else {
        notice = {notice: data.notice,client:'',partner:'',clientID:data.cliente,partnerID:''};
        if (data.isPartner){
          // user_emit = notice.client
          notice.partner = data.id;
          notice.partnerID = data.user;
        } else {
          // user_emit = notice.partner
          notice.client = data.id;
          // notice.clientID = data.user;
        }
        notices.push(notice)
      }

      var chat;
      var time = new Date()
      if (data.message !=""){
        try {
          if (data.notice) {
              chat = await Chat.findOne({"notice":data.notice, "client": data.cliente})
              if (chat){
                // find the respective chat and update
                await Chat.findOneAndUpdate(
                  {"notice":data.notice, "client": data.cliente},
                {
                  $push: {chat: {message: data.message, time: time, user: data.user}}
                }, {new: true})

              } else {

                // create a new chat
                var newChat = new Chat();
                newChat.notice = data.notice;
                newChat.client = data.cliente;
                newChat.chat = [{message: data.message, time: time, user: data.user}]
                await newChat.save();
              }
          }

        } catch (e){
          console.log(e);
        }
      }

        socket.emit("private-message-notice", {
          id: data.id, //client or partner
          message: data.message,
          time: time,
          notice: data.notice,
          me: true
        }) // Message to self for confirmation

        socket.to(user_emit).emit("private-message-notice", {
          id: socket.id, //partner or client
          message: data.message,
          time: time,
          notice: data.requirement,
          lastLogin: "Online"
        })

    })

    // Signals the streamer and viewers to show a specific reaction
    socket.on("stream-reaction", data => {
      if ( data.streamId ) io.to(`stream-${data.streamId}`).emit("stream-reaction", data)
    })

  })

}
