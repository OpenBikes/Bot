/* eslint no-console: "off" */

import express from 'express'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'

import config from './config'
import logger from './lib/logger'
import configureRoutes from './routes'

const log = logger('obot.core')

// Create Express server
const app = express()
app.set('port', config.port)

// Parse all JSON contents
app.use(bodyParser.json())

// Setup routes
configureRoutes(app)

// Override HTTP native method
app.use(methodOverride())

// Start Express server
app.listen(app.get('port'), () => {
	log.info({ port: app.get('port'), env: app.get('env') }, 'express server listening')
})

export default app
