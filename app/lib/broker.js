import redis from 'redis'
import logger from './logger'

const log = logger('obot.lib.broker')

function onAuth(err, res) {
  if (err) {
    log.error({ err }, 'failed to authenticate, exiting')
    process.exit(1)
  }

  log.info({ res }, 'successfully authenticated')
}

export function redisConn(host, port, pass) {
  const client = redis.createClient(port, host)

  if (pass) {
    log.info('trying to authenticate to redis server')
    client.auth(pass, onAuth)
  }

  client.on('connect', () => console.log({ host, port }, 'successfully connected to redis'))

  client.on('error', (err) => {
    log.error({ err }, 'error connecting to redis')

    // abort if Redis isn't available
    process.exit(1)
  })

  return client
}

