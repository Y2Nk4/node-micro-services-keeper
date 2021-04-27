import ProviderConfig from './structs/ProviderConfig';
import { ExtendedEtcd as Etcd } from './etcd';
import { Lease } from 'etcd3';
import { TProcessorConstructor } from 'thrift';
declare class ClientRecord {
    thriftConnection: object;
}
declare class Provider {
    providerConfig: ProviderConfig;
    etcdClient: Etcd;
    clientList: Record<string, ClientRecord>;
    etcdLease: Lease;
    etcdLeaseId: string;
    private rpcServer;
    private multiplexedProcessor;
    constructor(providerConfig: ProviderConfig);
    serve<TProcessor, THandler>(processor: TProcessorConstructor<TProcessor, THandler>, handler: THandler, options: any): Promise<void>;
}
export default Provider;
