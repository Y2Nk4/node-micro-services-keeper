import { Etcd3 as Etcd } from 'etcd3';
import EtcdConfig from './structs/EtcdConfig';
export declare class ExtendedEtcd extends Etcd {
    _keyPrefix: string;
}
export declare function connectToEtcd(etcdConfig: EtcdConfig): ExtendedEtcd;
