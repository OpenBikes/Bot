import moment from 'moment'

import config from '../config'
import logger from './logger'

const log = logger('obot.lib.util')

// Check error handling
export function msgErrorHandler(err, res, body) {
	if (err || res.body.error) {
		log.error({ err }, 'error sending message')
	} 
}

// Check if a date is valid
export function isValidDate(dateString) {
	return moment(dateString, config.dateFormat).isValid()
}
