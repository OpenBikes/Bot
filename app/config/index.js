export default {

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

}