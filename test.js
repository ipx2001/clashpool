const moment = require("moment")
const yaml = require("yaml");
const request = require("./utils/request");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");
const os = require("os")

setTimeout(() => {
    request("http://124.222.33.208:9090/configs").then((res)=>{
    console.log(res.data);
    })
}, 10*1000);
