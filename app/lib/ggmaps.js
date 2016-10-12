import config from '../config'
import { msgErrorHandler } from './util'
import logger from './logger'
import request from 'superagent'

const log = logger('obot.lib.ggmaps')

let directionsURL = (origin, destination) => `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${config.googlemaps.accessToken}`	
const googleApiHeaders = { Accept: 'application/json' }

export function requestDirectionsAPI(origin, destination) {	
	const url = directionsURL(origin, destination)

	return new Promise((resolve, reject) => {
	    log.info({ url, origin, destination }, 'getting directions with Google Directions API')
	    request
	      .get(url)
	      .set(googleApiHeaders)
	      .end((err, res) => {
	        return err ? reject(err) : resolve(res.body)
	      })
  	})
}