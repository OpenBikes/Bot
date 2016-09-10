import logger from './logger'
import { redisConn } from './broker'
import config from '../config'

const log = logger('obot.lib.state')

// Launch Redis client
const redis = redisConn(config.broker.host, config.broker.port, config.broker.pass)

const convertReply = reply => parseInt(reply) || 0

export function getState(sender) {
  return new Promise((resolve, reject) => {
    redis.get(sender, (err, reply) => {
    	return err ? reject(err): resolve(convertReply(reply))
    })
  })
}

export function updateState(sender) {
  return new Promise((resolve, reject) => {
    redis.exists(sender, (err, reply) => {
      if (reply === "1" || reply === 1) {
        console.log('Key exists')
        redis.get(sender, (err, reply) => {
          console.log(reply)
          let state = convertReply(reply) + 1
          redis.set(sender, state, (err, reply) => {
            return err ? reject(err): resolve(state)
          })
        })
      } else {
        console.log('Key does not exist')
        let state = 0
        redis.set(sender, state, (err, reply) => {
          return err ? reject(err): resolve(state)
        })
      }
	    return err ? reject(err) : null
    })
  })
}