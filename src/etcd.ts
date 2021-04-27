import { Etcd3 as Etcd } from 'etcd3'
import EtcdConfig from './structs/EtcdConfig'

export class ExtendedEtcd extends Etcd {
  _keyPrefix: string
}

export function connectToEtcd (etcdConfig: EtcdConfig): ExtendedEtcd {
  let etcd: ExtendedEtcd = new ExtendedEtcd({
    hosts: etcdConfig.host,
    auth: {
      username: etcdConfig.username,
      password: etcdConfig.password
    }
  })

  etcd._keyPrefix = etcdConfig.keyPrefix

  return etcd
}
