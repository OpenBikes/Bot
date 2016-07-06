/* eslint no-console: "off" */

import express from 'express'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'

import config from './config'
import { redisConn } from './lib/broker'
import logger from './lib/logger'
import configureRoutes from './routes'

const log = logger('obot.core')


// Create Express server
const app = express()
app.set('port', config.port)

// Parse all JSON contents
app.use(bodyParser.json())

// Override HTTP native methode
app.use(methodOverride())

// Launch Redis client
const client = redisConn(config.broker.host, config.broker.port, config.broker.pass)

// Setup routes
configureRoutes(app, client)

// Start Express server.
app.listen(app.get('port'), () => {
	log.info({ port: app.get('port'), env: app.get('env') }, 'express server listening')
})

export default app
