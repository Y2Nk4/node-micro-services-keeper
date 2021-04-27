import { configure } from 'log4js'

export * from './provider'
export * from './structs/EtcdConfig'
export * from './structs/ProviderConfig'

configure({
  appenders: {
    console: {type: 'console'}
  },
  categories: {
    default: {
      appenders: [ "console" ], level: "ALL"
    },
    "ServiceKeeper:Provider": {
      appenders: [ "console" ], level: "ALL"
    }
  }
})

process.on('unhandledRejection', (reason, p) => {
  console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason)
  // application specific logging, throwing an error, or other logic here
})
