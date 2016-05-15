var express = require('express');
var app = express();
var bodyParser = require('body-parser');

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
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000)
