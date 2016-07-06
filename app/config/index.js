export default {

	port: process.env.PORT || 3000,

	accessToken: process.env.FB_ACCESS_TOKEN,
	verifyToken: process.env.FB_VERIFY_TOKEN,

	broker: {
		host: process.env.__BROKER_HOST__ || 'redis',
		port: process.env.__BROKER_PORT__ || 6379,
		pass: process.env.__BROKER_PASS__ || false,
	}

	requestFbMessenger: {
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: process.env.FB_ACCESS_TOKEN
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData,
		}
	}

	dateFormat: 'h:mm'

}