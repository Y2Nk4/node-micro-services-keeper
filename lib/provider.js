"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const etcd_1 = require("./etcd");
const thrift_1 = require("thrift");
let serviceKeeperThriftFiles = require('../../thrifts/generated/_loader');
class ClientRecord {
}
class Provider {
    constructor(providerConfig) {
        this.multiplexedProcessor = new thrift_1.default.MultiplexedProcessor();
        this.providerConfig = providerConfig;
    }
    async serve(processor, handler, options) {
        let transport = (options && options.transport) ? options.transport : thrift_1.TFramedTransport;
        let protocol = (options && options.protocol) ? options.protocol : thrift_1.TBinaryProtocol;
        // establish etcd connection
        this.etcdClient = etcd_1.connectToEtcd(this.providerConfig.etcdConfig);
        this.etcdLease = await this.etcdClient.lease(15, { autoKeepAlive: true });
        this.etcdLeaseId = await this.etcdLease.grant();
        let ServiceKeeperProcessor = serviceKeeperThriftFiles.ServiceKeeper.services.ServiceKeeper.Processor;
        console.log(this.etcdClient._keyPrefix);
    }
}
exports.default = Provider;
//# sourceMappingURL=provider.js.map