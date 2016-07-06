import redis from 'redis'

function onAuth(err, res) {
  if (err) {
    console.log({ err }, 'failed to authenticate, exiting')
    process.exit(1)
  }

  console.log({ res }, 'successfully authenticated')
}

export function redisConn(host, port, pass) {
  const client = redis.createClient(port, host)

  if (pass) {
    console.log('trying to authenticate to redis server')
    client.auth(pass, onAuth)
  }

  client.on('connect', () => console.log({ host, port }, 'successfully connected to redis'))

  client.on('error', (err) => {
    console.log({ err }, 'error connecting to redis')

    // abort if Redis isn't available
    process.exit(1)
  })

  return client
}
