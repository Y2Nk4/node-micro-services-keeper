import { getLogger } from 'log4js'
import ProviderConfig from './structs/ProviderConfig'
import { ExtendedEtcd as Etcd, connectToEtcd } from './etcd'
import { Lease } from 'etcd3'
import {
  TFramedTransport, TBinaryProtocol, TProcessorConstructor, MultiplexedProcessor,
  createMultiplexServer
} from 'thrift'
import { v4 as ipv4 } from 'internal-ip'
import { EventEmitter } from 'events'
import ClientConnection from './connections/ClientConnection'

let portfinder = require('portfinder')
let serviceKeeperThriftFiles = require('../thrifts/generated/_loader')

let logger = getLogger('ServiceKeeper:Provider')

interface RPCService <TProcessor, THandler> {
  processor: TProcessorConstructor<TProcessor, THandler>,
  handler: THandler,
}

export class Provider extends EventEmitter {
  providerConfig: ProviderConfig
  etcdClient: Etcd
  clientList: Record<string, ClientConnection>
  etcdLease: Lease
  etcdLeaseId: string

  private rpcServer
  private multiplexedProcessor = new MultiplexedProcessor()

  constructor (providerConfig: ProviderConfig) {
    super()
    this.providerConfig = providerConfig
  }

  async serve<TProcessor, THandler> (
    services: Record<string, RPCService<TProcessor, THandler>>,
    options
  ) {
    // prepare thrift transport and protocol
    let transport = (options && options.transport) ? options.transport : TFramedTransport
    let protocol = (options && options.protocol) ? options.protocol : TBinaryProtocol

    // establish etcd connection
    this.etcdClient = connectToEtcd(this.providerConfig.etcdConfig)
    this.etcdLease = await this.etcdClient.lease(15, { autoKeepAlive: true })
    this.etcdLeaseId = await this.etcdLease.grant()

    // prepare ServiceKeeper processor
    let ServiceKeeperProcessor = serviceKeeperThriftFiles.ServiceKeeper.services.ServiceKeeper_Provider.Processor
    this.multiplexedProcessor.registerProcessor('ServiceKeeper.Protected', new ServiceKeeperProcessor({
      async registerClient(clientInfo) {
        return this.registerClient(clientInfo)
      },
      async ping() {
        return Promise.resolve('PONG')
      }
    }))

    for (let serviceName in services){
      if (services.hasOwnProperty(serviceName)) {
        let { processor, handler } = services[serviceName]
        if (processor.hasOwnProperty('Processor')) {
          processor = processor.Processor
        }
        this.multiplexedProcessor.registerProcessor(serviceName, new processor(handler))
      }
    }

    this.providerConfig.connectIP = this.providerConfig.connectIP || ipv4.sync()
    this.providerConfig.servePort = this.providerConfig.servePort || await portfinder.getPortPromise({
      port: 15000,
      stopPort: 20000
    })

    // prepare thrift multiplexing server
    this.rpcServer = createMultiplexServer(this.multiplexedProcessor, {
      transport, protocol
    })

    this.rpcServer.listen(this.providerConfig.servePort, () => {
      logger.info('RPC Server listening at', this.providerConfig.servePort)
    })

    console.log("prefix", this.etcdClient._keyPrefix)
  }

  protected async registerClient(clientInfo) {
    // this.clientList[clientInfo.ClientUUI] = new ClientConnection(clientInfo)
  }
}
