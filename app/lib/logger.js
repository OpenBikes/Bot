import bunyan from 'bunyan'
import config from '../config'

export default function (namespace=config.log.namespace, level=config.log.level) {
  return bunyan.createLogger({ name: namespace, level: level.toLowerCase() })
}
