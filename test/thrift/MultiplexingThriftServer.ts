// import thrift from 'thrift'
let thrift = require('thrift')
let serviceKeeperThriftFiles = require('../../thrifts/generated/_loader')

// https://github.com/zhuangjiesen/thriftNodejs
console.log(serviceKeeperThriftFiles)

let multiplexedProcessor = new thrift.MultiplexedProcessor()
let ServiceKeeperProcessor = serviceKeeperThriftFiles.ServiceKeeper.services.ServiceKeeper.Processor
multiplexedProcessor.registerProcessor('ServiceKeeper', new ServiceKeeperProcessor({
  ping (cb) {
    return cb(null, 'PONG')
  }
}))

let server = thrift.createMultiplexServer(multiplexedProcessor, {
  transport : thrift.TFramedTransport,
  protocol : thrift.TBinaryProtocol
})

server.listen(29999)
