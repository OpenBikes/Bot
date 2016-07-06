import logger from './logger'

const log = logger('obot.lib.state')

export function updateState(redis, sender) {	
	// Verify state
	redis.get(sender, function (err, reply) {
	    // Store senderId and initial state in Redis
		if (err) {
			redis.set(sender, 1)
		} // Update state 
		else {
			log.info({ state: reply, sender: sender }, 'actual state')
			redis.set(sender, parseInt(reply)+1)	
		}
	})	
	
	// This will return a JavaScript String
	redis.get(sender, function (err, reply) {
	    console.log(reply.toString()) 
	})
}