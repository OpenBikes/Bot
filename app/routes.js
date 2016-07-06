import config from './config'
import { userResponse } from './lib/messenger'
import { updateState } from './lib/state'

export default function (app, redis) {

	// Test connection over modulus
	app.get('/ping', function(req, res) {
		res.status(200).json({ ping: 'pong' })
	})

	// Verify crendentials
	app.get('/webhook', function(req, res) {
		if (req.query['hub.verify_token'] === config.verifyToken) {
			res.send(req.query['hub.challenge'])
		}
		res.send('Error, wrong validation token')
	})

	// Receive messaging events
	app.post('/webhook/', function(req, res) {
		const messaging_events = req.body.entry[0].messaging
		let i
		for (i = 0; i < messaging_events.length; i++) {
			let event = req.body.entry[0].messaging[i]
			let sender = event.sender.id

			if (event.message && event.message.text) {
				let text = event.message.text
				userResponse(sender, text)
				// Update user state for smart interactions
				updateState(redis, sender)
			}
		}
	res.sendStatus(200)
	})
}
