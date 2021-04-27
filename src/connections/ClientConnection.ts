import { getLogger } from 'log4js'
import { ExtendedEtcd } from '../etcd'
import thrift, { TFramedTransport, TBinaryProtocol, Multiplexer } from 'thrift'
import serviceKeeperThriftFiles from '../../thrifts/generated/_loader'

const logger = getLogger('ServiceKeeper:ClientConnection')

let services = {}
for (let thriftFilename in serviceKeeperThriftFiles) {
  if (serviceKeeperThriftFiles.hasOwnProperty(thriftFilename)) {
    for (let serviceName in serviceKeeperThriftFiles[thriftFilename].services) {
      if (serviceKeeperThriftFiles[thriftFilename].services.hasOwnProperty(serviceName)) {
        services[`${thriftFilename}/${serviceName}`] =
          serviceKeeperThriftFiles[thriftFilename].services[serviceName]
      }
    }
  }
}

export class ClientConnection {
  rawThriftConnection
  thriftClient
  clientInfo
  connectedAt: Date
  connectionError: boolean = false
  etcdClient: ExtendedEtcd
  connectionInfo
  connectionOptions
  private multiplexer: Multiplexer

  constructor (clientInfo, etcdClient, connectionOptions = {}) {
    this.clientInfo = clientInfo
    this.connectedAt = new Date()
    this.etcdClient = etcdClient
    this.connectionOptions = connectionOptions
  }

  async getConnection () {
    if (this.clientInfo.DuplexConnection) {
      try {
        if (!this.connectionError) {
          // Connection is good, but needs to ping to test
          let result = await this.thriftClient.ping()
          if (result === 'PONG') {
            this.connectionError = false
            return this.thriftClient
          } else {
            this.connectionError = true
          }
        }
      } catch (e) {
        this.connectionError = true
      }

      if (!this.clientInfo.ClientConnectionInfo) {
        let { ServiceName, ClientUUID } = this.clientInfo
        let rawConfig = await this.etcdClient.get(`/Service/${ServiceName}/${ClientUUID}/config`)
        if (!rawConfig) {
          return Promise.reject(new Error(`Cannot Find Connection Configuration of ${ClientUUID}`))
        }
        this.clientInfo = JSON.parse(rawConfig)
      } else {
        this.connectionInfo = Object.assign(this.clientInfo.ClientConnectionInfo, {
          ClientUUID: this.clientInfo.ClientUUID,
          ServiceName: this.clientInfo.ServiceName
        })
      }

      return this.establishConnection(this.connectionInfo, this.connectionOptions)
    }
  }

  private async establishConnection (connectionInfo, options) {
    let transport = (options && options.transport) ? options.transport : TFramedTransport
    let protocol = (options && options.protocol) ? options.protocol : TBinaryProtocol

    this.rawThriftConnection = thrift.createConnection(connectionInfo.IPAddress, connectionInfo, {
      transport, protocol
    })
    this.rawThriftConnection.on('error', (err) => {
      logger.error(err)
      this.connectionError = true
    })

    this.multiplexer = new Multiplexer()
  }
}

export default ClientConnection
