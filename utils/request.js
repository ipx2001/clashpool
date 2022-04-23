const axios = require("axios");
const config = require("./config")
const http = require("http")
const service = axios.create({

    timeout: 30000, // 请求超时时间
    httpAgent: new http.Agent({ keepAlive: false }),
    proxy: config.$config.proxy.enabled ? {
        protocol: config.$config.proxy.protocol,
        host: config.$config.proxy.host,
        port: config.$config.proxy.port,
    } : null
})

module.exports = service
