import config from '../config'
import logger from './logger'
import { userResponse, sendTextMessage } from './messenger'
import { updateState, getState } from './state'
import _ from 'lodash'

const log = logger('obot.middleware')

export function getPing(req, res) {
  res.status(config.OK).json({ ping: 'pong' })
}

export function verifyCredentials(req, res) {
	if (req.query['hub.verify_token'] === config.verifyToken) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong validation token')
}

export function handleMsgEvents(req, res) {
	const messaging_events = req.body.entry[0].messaging

	for (var i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id

		console.log(event.message)
		if (event.message && event.message.text) {
			let text = event.message.text
			userResponse(sender, text)
			sendTextMessage(sender, text)
			
			// Update user state for smart interactions
			updateState(sender, 'location')

			let state = getState(sender)
			console.log(state)
			if (state === 'welcome') {
				_.forEach(config.message_step_1, function(msg) {
					sendTextMessage(sender, msg)
				})
			}
		} else if (event.postback) {
        	let text = event.postback
        	sendTextMessage(sender, "Postback received: " + text)
      	} else if (_.has(event.message, 'attachments') && event.message.attachments[0].type === 'location') {
			let attachments = event.message.attachments[0];
			let coordinates = attachments.payload.coordinates;
			userResponse(sender, coordinates);
			updateState(sender, 'time')
			sendTextMessage(sender, "When do you want to go ?");
			sendTextMessage(sender, "Respond choices : now / at HH:MM");
		}
	}
	res.sendStatus(200)
}