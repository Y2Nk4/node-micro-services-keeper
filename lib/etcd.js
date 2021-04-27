"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToEtcd = exports.ExtendedEtcd = void 0;
const etcd3_1 = require("etcd3");
class ExtendedEtcd extends etcd3_1.Etcd3 {
}
exports.ExtendedEtcd = ExtendedEtcd;
function connectToEtcd(etcdConfig) {
    let etcd = new ExtendedEtcd({
        hosts: etcdConfig.host,
        auth: {
            username: etcdConfig.username,
            password: etcdConfig.password
        }
    });
    etcd._keyPrefix = etcdConfig.keyPrefix;
    return etcd;
}
exports.connectToEtcd = connectToEtcd;
//# sourceMappingURL=etcd.js.map