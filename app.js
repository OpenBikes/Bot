var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var dotenv = require('dotenv').config();

var access_token = process.env.FB_ACCESS_TOKEN;
var verify_token = process.env.FB_VERIFY_TOKEN;

var app = express();

// Parse all json contents
app.use(bodyParser.json())

// Listen to config port (localhost:8080) or to localhost:3000
// app.listen(process.env.PORT);
app.listen(3000);

// Send message
function sendTextMessage(sender, text) {
  messageData = {
	  text: text
  }
  request({
	  url: 'https://graph.facebook.com/v2.6/me/messages',
	  qs: { access_token: access_token },
	  method: 'POST',
	  json: {
		  recipient: { id: sender },
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
	  qs: { access_token: access_token },
	  method: 'POST',
	  json: {
		  recipient: { id: sender },
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

function welcome_step_1(sender) {
    sendTextMessage(sender, "We need to ask your current position in order to predict bikes or stands.");
    console.log("We need to ask your current position in order to predict bikes or stands.");
}
function welcome_step_2(sender) {
    sendTextMessage(sender, "But.. how to share my current position ? It's very simple.");
    console.log("But.. how to share my current position ? It's very simple.");
}
function welcome_step_3(sender) {
    sendTextMessage(sender, "Tap Location logo. You'll see a blue circle at your current location.");
    console.log("Tap Location logo. You'll see a blue circle at your current location.");
}
function welcome_step_4(sender) {
    sendTextMessage(sender, "Finally, tap send.");
    console.log("Finally, tap send.");
}


// Make a call to OpenBikes API for a city
function getCityLastGeoJSON(sender, city) {
  var url = "http://openbikes.co/api/geojson/" + city

  request({
	  url: url,
	  json: true
  }, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
		  stations = body.features;
		  for (i = 0; i < stations.length; i++) {
			  station_name = stations[i].properties.name;
			  console.log(station_name)
			  sendTextMessage(sender, station_name);
		  }
	  }
  })
}

function sendMakeChoiceMessage(sender) {
  messageData = {
	  "attachment": {
		  "type": "template",
		  "payload": {
			  "template_type": "generic",
			  "elements": [{
				  "title": "OpenBikes",
				  "subtitle": "Let me help you.",
				  "buttons": [{
					  "type": "postback",
					  "title": "Pick up a bike",
					  "payload": "pickbike",
				  }, {
					  "type": "postback",
					  "title": "Drop a bike off",
					  "payload": "dropbike",
				  }, {
					  "type": "postback",
					  "title": "Make a trip",
					  "payload": "fulltrip",
				  }],
			  }]
		  }
	  }
  };
  request({
	  url: 'https://graph.facebook.com/v2.6/me/messages',
	  qs: { access_token: access_token },
	  method: 'POST',
	  json: {
		  recipient: { id: sender },
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

// Pick a bike
function pickbike(sender, text) {
  sendTextMessage(sender, text);
  // getCities();
}

// Drop a bike off
function dropbike(sender, text) {
  sendTextMessage(sender, text);
}

// Make a full trip
function fulltrip(sender, text) {
  sendTextMessage(sender, text);
}

function askCity(sender) {
  response = 'Can you tell me in what city you are ?';
  sendTextMessage(sender, response);
}

// ROUTING

// Test connection over modulus
app.get('/ping', function(req, res) {
  res.send('pong')
});

// Verify crendentials
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === verify_token) {
	  res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

// Receive messaging events
app.post('/webhook/', function(req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
	  event = req.body.entry[0].messaging[i];

      sender = event.sender.id;
      console.log(event.message)

	  if (event.message && event.message.text) {
		  text = event.message.text;
		  console.log(text);

          setTimeout(function() {
              welcome_step_1(sender);
          }, 1000)
          setTimeout(function() {
              welcome_step_2(sender);
          }, 2000)
          setTimeout(function() {
              welcome_step_3(sender);
          }, 3000)
          setTimeout(function() {
              welcome_step_4(sender);
          }, 4000)

		//   if (text == 'Choose') {
		// 	  sendMakeChoiceMessage(sender);
		// 	  continue;
		//   }
		//   else if (text === 'Countries') {
		// 	//   getCountries();
		// 	  continue;
		//   }
		//   else if (text === 'Website') {
		// 	  sendGenericMessage(sender);
		// 	  continue;
		//   }
		//   sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
	  }
      else if (event.postback) {
		  text = event.postback.payload;
		  console.log(text);
		  if (text === 'pickbike') {
			  response = 'I notice you want to pick a bike'
			  pickbike(sender, response);
			  continue;
		  } else if (text === 'dropbike') {
			  response = 'I notice you want to drop a bike off'
			  dropbike(sender, response);
			  continue;
		  } else if (text === 'fulltrip') {
			  response = 'I notice you want to make a full trip'
			  fulltrip(sender, response);
			  continue;
		  }
	  }
      else if (event.message.hasOwnProperty('attachments')) {
          console.log(event.message.attachments);
          attachments = event.message.attachments[0];
          coordinates = attachments.payload.coordinates;
          console.log(coordinates);
          console.log(coordinates.lat);
          console.log(coordinates.long);
      }
  }
  res.sendStatus(200);
});
