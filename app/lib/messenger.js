import config from '../config'
import { msgErrorHandler } from './util'

// Send message
export function sendTextMessage(sender, text) {
	messageData = {
		text: text
	}
	request(config.requestFbMessenger, msgErrorHandler(err, res, body))
}

// Send a message with a Template
export function sendGenericMessage(sender) {
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
	}
	request(config.requestFbMessenger, msgErrorHandler(err, res, body))
}

// Debug the user response
export function userResponse(sender, text) {
	console.log('%s response : %s', sender, text)
}

export function sendMakeChoiceMessage(sender) {
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
	request(config.requestFbMessenger, msgErrorHandler(err, res, body))
}
