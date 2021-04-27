let thrift = require('thrift')
let serviceKeeperThriftFiles = require('../../thrifts/generated/_loader')

let connection = thrift.createConnection("localhost", 29999, {
  transport : thrift.TFramedTransport,
  protocol : thrift.TBinaryProtocol
})
connection.on('error', function(err) {
  console.error(err);
})
console.log('connection established')

let multiplexer = new thrift.Multiplexer()

let client = multiplexer.createClient(
  'ServiceKeeper',
  serviceKeeperThriftFiles.ServiceKeeper.services.ServiceKeeper,
  connection)

console.log(client.ping)

client.ping((err, result) => {
  console.log(err, result)
})

console.log('ping, wait')
