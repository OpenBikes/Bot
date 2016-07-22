export default {

	OK: 200,
	port: process.env.PORT || 3000,

	accessToken: process.env.FB_ACCESS_TOKEN,
	verifyToken: process.env.FB_VERIFY_TOKEN,

	broker: {
		host: process.env.__BROKER_HOST__ || 'redis',
		port: process.env.__BROKER_PORT__ || 6379,
		pass: process.env.__BROKER_PASS__ || false,
	},

	log: {
    	level: process.env.LOG_LEVEL || 'debug',
    	namespace: process.env.LOG_NAMESPACE || 'obot',
  	},

	dateFormat: 'h:mm',

	message_step_1: ["We need to ask your current position in order to predict bikes or stands.", "But.. how to share my current position ? It's very simple.", "Tap Location logo. You'll see a blue circle at your current location.", "Finally, tap send."]
}
