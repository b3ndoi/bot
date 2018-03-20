const messages = require('./messages');
const facebook = require('./facebook');
const user = require('./user');
var token = "EAATPaqX2Nd0BAPbtN7wjZCfJyfo9LCbsqbAbnb3TvFJZAoY43xDY9LE95t4JSFwLvOZBO85EusDhqnsjoUHXrr4mBBrr4omT03e7a8vIDMyyzOWPt1zGaTtrNWiX0l0VZCkFTMYjxMBv9yhiDhLKLiKPAqIMOGNQEmNVI6lZCbwZDZD";
exports.for_me = (sender, values) => {
  let tekst = 'Hajde da zajedno otkrijemo da li spadate u rizičnu grupu, odnosno da li treba da radite prenatalni Verified test.\n Koliko imate godina? ';

  messages.sendChoiceMessageVerified(sender,tekst,"MANJE OD 35","VIŠE OD 35", "manje", "vise");
};

exports.ne_hvala = (senderID, values) => {
  messages.sendTextMessage(senderID, 'Prijatno');
};

exports.zdravo = (senderID, values)=>{
  user.checkUser(senderID, function(senderId, message){
    if(message.message == 'true'){
      console.log('nalog vec postoji');
      user_info = facebook.getUserInfo(token, senderID, function(data,senderID){

              messages.sendTextMessage(senderID, 'Znamo se '+data.first_name+' :)');
              setTimeout(function () {
                messages.sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
              }, 500);
            });
      novi_korisnik = false;
    }else{
      console.log('novi nalog');
      user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
              user.saveUser(senderID, data);
              messages.sendTextMessage(senderID, 'Dobrodošla '+data.first_name+' u Bebac porodicu! Ja sam tvoj Bebac savetnik i tu sam da pomognem tebi i tvojoj bebi. :)');
              setTimeout(function () {
                messages.sendChoiceMessage(senderID,"Da li želiš da pričamo?","Da želim","Ne hvala");
              }, 500);
            });
    }
  });
};

exports.hello = (senderID, values)=>{
  
  messages.sendTextMessageWithImage(senderID, "http://chat-bot.rs/assets/images/1920/chatbot_pitanja.png");
  setTimeout(function () {
    messages.sendTextMessage(senderID, "Hello Mr Naghi! \n I'm Cody the 5th element of this team! Nice to meet you. \n How are you?");
  }, 500);
};


exports.super = (senderID, values)=>{
  
    
  messages.sendTextMessage(senderID, "Glad to hear that. Enjoy your stay in Belgrade!");
  setTimeout(function () {
    messages.sendChoiceMessage(senderID,"Do you have any questions for me?","Yes","No");
  }, 500);
};

exports.bad = (senderID, values)=>{
  
    
  messages.sendTextMessage(senderID, "I'm sorry to hear that. Hope you will change your mood soon. \n Enjoy your stay in Belgrade!");
  setTimeout(function () {
    messages.sendChoiceMessage(senderID,"Do you have any questions for me?","Yes","No");
  }, 500);
};

exports.yes = (senderID, values)=>{
  
    
  messages.sendTextMessage(senderID, "Shoot!");

};

exports.no = (senderID, values)=>{
  
    
  messages.sendTextMessage(senderID, "Enjoy your stay in Belgrade!");
  
};