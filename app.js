var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var dotenv = require('dotenv').config();

var access_token = process.env.FB_ACCESS_TOKEN;
var verify_token = process.env.FB_VERIFY_TOKEN;


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
      if (text === 'Toulouse') {
          getCityLastGeoJSON(text);
          continue;
      }

      if (text === 'Website') {
          sendGenericMessage(sender);
          continue;
      }
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

// Send message
function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:access_token},
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

// Send a message with a Template
function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "OpenBikes website",
          "subtitle": "Not Just Biking",
          "image_url": "http://openbikes.co/static/img/OpenBikes.png",
          "buttons": [{
            "type": "web_url",
            "url": "http://openbikes.co",
            "title": "Web url"
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:access_token},
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

// Make a call to OpenBikes api
function getCityLastGeoJSON(city) {
    var url = "http://openbikes.co/api/geojson/" + city

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body)
        }
    })
}

app.listen(process.env.PORT || 3000)
