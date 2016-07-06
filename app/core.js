/* eslint no-console: "off" */

import express from 'express'
import config from './config'
import { redisConn } from './lib/broker'

// Create Express server.
const app = express()

// Parse all JSON contents
app.use(bodyParser.json())

// Launch Redis client
const client = redisConn(config.broker.host, config.broker.port, config.broker.pass)

// Start Express server.
app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode',
      app.get('port'),
      app.get('env'))
})

export default app
