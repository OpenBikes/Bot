import config from '../config'
import { msgErrorHandler } from './util'
import logger from './logger'

const log = logger('obot.lib.messenger')


export function requestFbMessenger(sender, messageData) {
	return {
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: config.accessToken
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender,
			},
			message: messageData,
		}
	}
}

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
export const userResponse = (sender, text) => log.info({ sender, text }, 'new message received')

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
