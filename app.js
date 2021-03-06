var express = require('express');
var request = require('request');
var parser = require('body-parser');

const messages = require('./modules/messages');
const facebook = require('./modules/facebook');
const user = require('./modules/user');
const processor = require('./modules/processor');
const functions = require('./modules/functions');
console.log(messages);
var app = express();
var port = process.env.PORT || 8080;
app.use(parser.json());
app.get('/', function (req, res) {
    res.send('Hello from Facebook Messenger Bot');
    // console.log(req);
});
const token = "EAATPaqX2Nd0BAPbtN7wjZCfJyfo9LCbsqbAbnb3TvFJZAoY43xDY9LE95t4JSFwLvOZBO85EusDhqnsjoUHXrr4mBBrr4omT03e7a8vIDMyyzOWPt1zGaTtrNWiX0l0VZCkFTMYjxMBv9yhiDhLKLiKPAqIMOGNQEmNVI6lZCbwZDZD";
var user_info;

let verified = false;
let brojevi = false;
let qpayload;
var novi_korisnik = true;
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'sifra_za_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  console.log(data);
  // Make sure this is a page subscription

  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    // if(data.quick_reply){
    //   console.log('Naslo');
    // }
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {

        if (event.message) {
          let result = processor.match(event.message.text);
          if (result) {
                let function_find = functions[result.handler];
                if (function_find && typeof function_find === "function" && !verified) {
                    function_find(event.sender.id, result.match);
                } else {
                    console.log("Handler " + result.handler + " is not defined");
                }
            }else{
          receivedMessage(event);
            }
        }else if(event.postback){
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedPostback(event){
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log(event.postback.payload);
  let payload = event.postback.payload;

  if(payload == 'get_started'){

    
      
    messages.sendTextMessageWithImage(senderID, "http://chat-bot.rs/assets/images/1920/ko_je_kodi_1920x1080.png");
    setTimeout(() => {
      messages.sendTextMessage(senderID, "Hello Mr Naghi! \n I'm Cody the 5th element of this team! Nice to meet you. \n How are you?");
    }, 2500);
    
     
  }
  else if(payload.substring(13, payload.length) == 'ocekivanja'){

    sendOffers(payload.substring(2, 13), senderID, payload.substring(0, 1), function(senderID, data, broj,nedelja_trudnoce){
      console.log(data);
      messages.sendTextMessage(senderID, data.tekst);
      setTimeout(function () {
        messages.sendOptionMessage(senderID, data, broj,nedelja_trudnoce);
      }, 500);
    });
  }
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  // console.log("Received message for user %d and page %d at %d with message:",
    // senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;

  var messageAttachments = message.attachments;
  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    
      // checkUser(senderID, function(senderId, message){
      //   if(message.message){
      //     console.log('nalog vec postoji');
      //     novi_korisnik = false;
      //   }else{
      //     console.log('novi nalog');
      //   }
      // });
      switch (messageText.toLowerCase()) {
        case 'generic':
          messages.sendGenericMessage(senderID);
          break;
        case 'da želim':{

          user.checkUser(senderID, function(senderId, message){
            if(message.datum_porodjaja){
              user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
                messages.sendTextMessage(senderID, 'Draga '+data.first_name+', sada si u '+message.datum_porodjaja+" nedelji trudnoće.");
                  console.log(message);
                sendOffers(message.datum_porodjaja_da , senderID, message.datum_porodjaja,function(senderID, data, broj, nedelja_trudnoce){
                  console.log(data);

                  if(!data.status){
                    brojevi = false;
                    messages.sendTextMessage(senderID, data.title);
                    setTimeout(function () {
                      messages.sendOptionMessage(senderID, data, broj, nedelja_trudnoce);
                    }, 500);
                  }else{
                    messages.sendTextMessage(senderID, data.message);
                  }
                });

              });
            }else{
              user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
                messages.sendChoiceMessage(senderID, 'Draga '+data.first_name+', da li si trudna?',"Jesam","Ne nisam");
              });
            }
          });
          break;
        }
        case 'jesam':{

          user_info = facebook.getUserInfo(token, senderID, function(data,senderID){
            messages.sendTextMessage(senderID, 'Čestitamo '+data.first_name+' :)Želimo vam lepu i bezbrižnu trudnoću! Kad očekujete bebu? Upiši verovatni termin porođaja: DD.MM.GGGG.');
            brojevi = true;
          });
          break;
        }
        default:
          
          messages.sendTextMessage(senderID, "I'm still young, but I'm sure that my team mates will assist.");
          

      }
    
  }
  else if (messageAttachments) {
    messages.sendTextMessage(senderID, "Message with attachment received");
  }
}


function sendOffers(broj, sender, nedelja_trudnoce, callback) {
        request({
            url: 'http://lsapp.apps-codeit.com/api/posts/' + broj,
            method: 'GET'
        }, function (error, response, body) {
            if (error) {
                console.log('Error getting user data: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            } else {
                var offers = JSON.parse(body);
                callback(sender, offers, broj, offers.id);
            }
        });
}

app.listen(port, function () {
    console.log("Server listening on port:"+port);
});
