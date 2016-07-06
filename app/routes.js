import config from './config'
import { userResponse } from './lib/messenger'

export default function (app) {

	// Test connection over modulus
	app.get('/ping', function(req, res) {
		res.send('pong')
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
		messaging_events = req.body.entry[0].messaging
		for (i = 0 i < messaging_events.length i++) {
			event = req.body.entry[0].messaging[i]

			sender = event.sender.id

			if (event.message && event.message.text) {
				text = event.message.text
				userResponse(sender, text)
			}
	}
	res.sendStatus(200)
})
