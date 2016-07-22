import logger from './logger'
import { redisConn } from './broker'
import config from '../config'

const log = logger('obot.lib.state')

// Launch Redis client
const redis = redisConn(config.broker.host, config.broker.port, config.broker.pass)

export function updateState(sender, stateToUpdate) {	
	// Verify state
	redis.exists(sender, function(err, reply) {
		log.info({ state: reply.toString(), sender }, 'actual state')
	    // Key exists so update sender state 
		if (reply === 1) {
			redis.get(sender, function(err, reply) {
				log.info({ state: stateToUpdate, sender }, 'update state')
				redis.set(sender, stateToUpdate)	
			})
		}
		// Key doesn't exists so set initial state
		else {
			log.info({ state: 'welcome', sender }, 'init state')
			redis.set(sender, 'welcome')
		}
	})	
}

export function getState(sender) {
	return redis.get(sender, function (err, reply) {
		if (reply) {
			console.log('reply', reply)
		} else {
			log.error({ err }, 'error getting key')
		}
	})
}