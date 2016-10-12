import logger from './logger'
import { msgErrorHandler } from './util'

import request from 'superagent'

const log = logger('obot.obapi')

const obapiURL = 'http://api.openbikes.co'
const obapiHeaders = { 'Content-Type': 'application/json' }

function filteredStationsJSON(city, limit, lat, lon, kind, mode, quantity) {
	return {
		'city_slug': city,
		'limit': limit,
		'latitude': lat,
		'longitude': lon,
		'kind': kind,
		'mode': mode,
		'desired_quantity': quantity
	}
}


export function getClosestCity(lat, lon) {
	const uri = `${obapiURL}/closest_city/${lat}/${lon}`

	return new Promise((resolve, reject) => {
	    log.info({ uri, lat, lon }, 'fetching closest city')
	    request
	      .get(uri)
	      .set(obapiHeaders)
	      .end((err, res) => {
	        return err ? reject(err) : resolve(res.body)
	      })
  	})
}

export function getFilteredStations(city, limit, lat, lon, kind, mode, quantity) {
	const uri = `${obapiURL}/filtered_stations`
	const json = filteredStationsJSON(city, limit, lat, lon, kind, mode, quantity)

	return new Promise((resolve, reject) => {
	    log.info({ uri, city, limit, lat, lon, kind, mode, quantity }, 'fetching filtered stations')
	    request
	      .post(uri)
	      .send(json)
	      .set(obapiHeaders)
	      .end((err, res) => {
	        return err ? reject(err) : resolve(res.body)
	      })
  	})
}
