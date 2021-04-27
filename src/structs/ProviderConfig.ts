import EtcdConfig from './EtcdConfig'

export interface ProviderConfig {
  etcdConfig: EtcdConfig
  servePort: number
  connectIP: string
}

export default ProviderConfig
