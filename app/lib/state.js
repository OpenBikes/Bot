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
    	err ? reject(err): resolve(reply)
    })
  })
}

export function updateState(sender) {
  return new Promise((resolve, reject) => {
    redis.exists(sender, (err, reply) => {
		redis.set(sender, convertReply(reply)+1)
	    return err ? reject(err): resolve(reply)
    })
  })
}