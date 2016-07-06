import config from '../config'
import moment from 'moment'

// Check error handling
export function msgErrorHandler(err, res, body) {
	if (err) {
		console.log('Error sending message: ', err)
	} else if (response.body.error) {
		console.log('Error: ', response.body.error)
	}
}

// Check if a date is valid
export function isValidDate(dateString) {
	return moment(dateString, config.dateFormat).isValid()
}
