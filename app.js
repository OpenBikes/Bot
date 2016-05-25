const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dotenv = require('dotenv').config();
const _ = require('lodash');
const moment = require('moment');
const clc = require('cli-color');
const redis = require('redis');

// Predefine needed stylings
const error = clc.red.bold;
const warn = clc.yellow;
const info = clc.cyan.bold;
const debug = clc.magenta.italic;
const user = clc.green;
const server = clc.yellow.bold;

// Global variables
const access_token = process.env.FB_ACCESS_TOKEN;
const verify_token = process.env.FB_VERIFY_TOKEN;

var dateFormat = 'h:mm';

// Launch Redis client
var client = redis.createClient();

// Launch App
var app = express();

// Parse all json contents
app.use(bodyParser.json())

// Listen to config port (localhost:8080) or to localhost:3000
app.listen(process.env.PORT || 3000);
console.log(server('Server is running.'));

// Connect to Redis database
client.on('connect', function() {
	console.log(info('Connected to Redis'));
});
// Handle Redis errors
client.on("error", function(err) {
	console.log("Error " + err);
});

// Send message
function sendTextMessage(sender, text) {
	messageData = {
		text: text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: access_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log(error('Error sending message: ', error));
		} else if (response.body.error) {
			console.log(error('Error: ', response.body.error));
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
		qs: {
			access_token: access_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log(error('Error sending message: ', error));
		} else if (response.body.error) {
			console.log(error('Error: ', response.body.error));
		}
	});
}

// Debug the user response
function userResponse(sender, text) {
	console.log(user(sender + ' respond : '));
	console.log(text);
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
		qs: {
			access_token: access_token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log(error('Error sending message: ', error));
		} else if (response.body.error) {
			console.log(error('Error: ', response.body.error));
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

// Check if a date is valid
function isValidDate(dateStr) {
	return moment(dateStr, dateFormat).isValid()
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

		if (event.message && event.message.text) {
			text = event.message.text;
			userResponse(sender, text);

			welcome_step_1(sender);
			welcome_step_2(sender);
			welcome_step_3(sender);
			welcome_step_4(sender);

			if (text == 'Now') {
				userResponse(sender, text);
				now = moment().unix();
				console.log(user(now));
			} else if (isValidDate(text)) {
				userResponse(sender, text);
				date = moment(text, dateFormat).unix();
				console.log('Date is valid');
				console.log(user(date));
				sendMakeChoiceMessage(sender);
				client.hmset(sender, {
					"date": date,
					"text": text
				});
				client.hgetall(sender, function(err, obj) {
					console.log(obj);
				});
			}

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
		} else if (event.postback) {
			text = event.postback.payload;
			userResponse(sender, text);
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
		} else if (_.has(event.message, 'attachments')) {
			attachments = event.message.attachments[0];
			coordinates = attachments.payload.coordinates;
			userResponse(sender, coordinates);
			sendTextMessage(sender, "When do you want to go ?");
			sendTextMessage(sender, "Respond choices : now / at HH:MM");
		}
	}
	res.sendStatus(200);
});