import config from '../config'
import logger from './logger'

const log = logger('obot.lib.util')

// Check error handling
export function msgErrorHandler(err, res, body) {
	if (err || res.body.error) {
		log.error({ err }, 'error sending message')
	} 
}

