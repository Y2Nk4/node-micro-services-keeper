<div align="center">

# Data Struct

</div>

## Etcd Data Struct
Data Struct Represented in JSON

Note:
- `-` Represents the directories in ETCD
- `>` Represents the Key-value in ETCD

```
- ${ EtcdPrefix }
    - Services
        - ${ Service1Name }
            - Providers
                - ${ Provider1UUID }
                    > UUID: UUID of this provider
                    > config: Connection info 
                              formatted in JSON
                    - connectedClients
                        > {Client1UUID}: UUID of this client
            - Clients
                - { Client1UUID }
                    > UUID: UUID of this info
                    > config: Connection info 
                              formatted in JSON
                    - connectedTo: UUID of the provider
```
Config JSON format
```json
{
    "IPAddress": "192.168.50.230",
    "ServiceName": "calculator",
    "ServicePort": 15000,
    "UUID": "7587851578943627162"
}
```
