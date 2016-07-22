import logger from './logger'
import { redisConn } from './broker'
import config from '../config'

const log = logger('obot.lib.state')

// Launch Redis client
const redis = redisConn(config.broker.host, config.broker.port, config.broker.pass)

export function updateState(sender) {	
	// Verify state
	redis.get(sender, function (err, reply) {
		log.info({ state: reply.toString(), sender: sender }, 'actual state')
	    // Store senderId and initial state in Redis
		if (reply === 'NaN') {
			log.info({ state: 1, sender: sender }, 'init state')
			redis.set(sender, 1)
		}
		// Update state 
		else {
			log.info({ state: reply.toString(), sender: sender }, 'update state')
			redis.set(sender, parseInt(reply)+1)	
		}
	})	
	
	// This will return a JavaScript String
	redis.get(sender, function (err, reply) {
		log.info({ state: reply.toString(), sender: sender }, 'new state')
	})
}

export function getState(sender) {
	return eval(redis.get(sender))
}