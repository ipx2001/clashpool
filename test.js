const moment = require("moment")
const yaml = require("yaml");
const request = require("./utils/request");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");
const os = require("os")


request("http://127.0.0.1:9090/configs").then((res)=>{
    console.log(res.data);
})