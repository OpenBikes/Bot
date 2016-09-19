import logger from './logger'
import { msgErrorHandler } from './util'

import request from 'superagent'

const log = logger('obot.obapi')

const obapiURL = 'http://api.openbikes.co'
const obapiHeaders = { Accept: 'application/json' }

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
