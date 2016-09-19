import config from '../config'
import logger from './logger'
import { redisConn } from './broker'
import { userResponse, sendTextMessage, sendMakeChoiceMessage } from './messenger'
import { updateState, getState } from './state'
import { getClosestCity } from './obapi'
import _ from 'lodash'

const log = logger('obot.middleware')

// Launch Redis client
const redis = redisConn(config.broker.host, config.broker.port, config.broker.pass)

export function getPing(req, res) {
  res.status(config.OK).json({ ping: 'pong' })
}

export function verifyCredentials(req, res) {
	if (req.query['hub.verify_token'] === config.verifyToken) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong validation token')
}

const hasMessage = (event) => event.message && event.message.text 

export function handleMsgEvents(req, res) {
	const messaging_events = req.body.entry[0].messaging

	_.forEach(messaging_events, function(event) {
		let sender = event.sender.id

		if (hasMessage(event)) {
			let text = event.message.text
			userResponse(sender, text)
			sendTextMessage(sender, text)

			getState(sender)
				.then(x => console.log({ state: x }, 'get state'))
				.then(updateState(sender))
				.then(x => console.log({ state: x }, 'update state'))
				.catch(onError(sender))
			
			sendMakeChoiceMessage(sender, text)

			// console.log(state)
			// if (state === 'welcome') {
			// 	_.forEach(config.message_step_1, function(msg) {
			// 		sendTextMessage(sender, msg)
			// 	})
			// }
		} else if (event.postback) {
        	let choice = event.postback.payload
        	console.log(choice)
        	sendTextMessage(sender, 'You choose ' + choice)
      	} else if (_.has(event.message, 'attachments') && event.message.attachments[0].type === 'location') {
			let attachments = event.message.attachments[0]
			let coordinates = attachments.payload.coordinates
			userResponse(sender, coordinates)
			
			getClosestCity(coordinates.lat, coordinates.long)
				.then(body => sendTextMessage(sender, 'You are located in '+ body.name))
				.catch(onError(sender))

			sendTextMessage(sender, 'When do you want to go ?')
			sendTextMessage(sender, 'Respond choices : now / at HH:MM')
		}
	}) 
	res.sendStatus(200)
}

function onError(sender) {
  return (err) => log.error({ err, sender }, 'caught error')
}