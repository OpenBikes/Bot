import { 
	getPing, 
	verifyCredentials, 
	handleMsgEvents 
} from './lib/middleware'

export default function (app, client) {

	// Test connection over modulus
	app.get('/ping', getPing)

	// Verify crendentials
	app.get('/webhook', verifyCredentials)

	// Receive messaging events
	app.post('/webhook/', handleMsgEvents)
}
