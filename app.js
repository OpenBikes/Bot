var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

// Parse all json contents
app.use(bodyParser.json())

// Test connection over modulus
app.get('/ping', function(req, res) {
    res.send('pong')
});

// Verify crendentials
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'Wyv6tMhBrGZfQ9Ut') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

// Receive messaging events
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      console.log(text);
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

var token = "EAAPwJrok5ZBYBAIQdZBtZBFclZAw88ZAyMfs9NbR9681M7Guh37UYZCoLtDuxOD1cSZCL8NhvqclLeW79aZAu4UZAEEIgnDuZCk32qZAD53AhFtkSflRXOV6NVdDpau0ZA5FYXZC4yvLiku1TaZCkCSieua5nQBZC0aXuVwzZCWQ0ArvUA18AwZDZD";

// Send message
function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.listen(process.env.PORT || 3000)
