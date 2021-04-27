import EtcdConfig from './EtcdConfig';
interface ProviderConfig {
    etcdConfig: EtcdConfig;
    servePort: number;
    connectIP: string;
}
export default ProviderConfig;
