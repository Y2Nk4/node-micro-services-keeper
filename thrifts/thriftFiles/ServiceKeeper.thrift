struct ClientInfo{
    1: required bool DuplexConnection,
    2: required string ServiceName,
    3: required string ClientUUID,
    4: optional string StartedAt,       // timestamp
    5: optional PodHardwareInfo PodHardwareInfo,
    6: optional ClientConnectionInfo ClientConnectionInfo
}

struct ClientConnectionInfo {
    1: required string IPAddress,
    2: required i16 ServicePort,
    3: required list<string> ProvidingService
}

struct PodHardwareInfo{
    1: required i8 CPU,                 // CPU count
    2: required double TotalMemory,     // in MegaBytes
    3: required string Platform
}

service ServiceKeeper_Provider{
    string ping();
    bool registerClient(1: ClientInfo clientInfo);
}
