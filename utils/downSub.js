const moment = require("moment")
const yaml = require("yaml");
const request = require("./request");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");
const os = require("os")
/**
 * 这个文件负责下载订阅
 */


//休眠函数
function sleep(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeout);
    })
}
//保存到文件
function saveToFile(sub, content) {
    return fs.writeFileSync(`./temp/${sub.id}.yaml`, content)
}


const dowmload = {
    //没有指定下载方法的全部使用这个方法下载
    //不管三七二十一，全转换成clash处理
    async common(sub, config, count = 0) {
        count += 1
        const url = `${config.$config.remote_conver}?target=clash&insert=false&config=${encodeURIComponent(config.$config.remote_config)}&url=${encodeURIComponent(sub.url)}`
        try {
            const res = await request({ url })
            if (res.status == 200) {
                //暂停1秒，因为有时候请求太快转换服务器好像有问题
                await sleep(1000)

                return res.data
            }
        } catch (error) {
            if (count < 3) {
                //如果失败，重试三次
                //暂停1秒，因为有时候请求太快转换服务器好像有问题
                await sleep(500)
                console.log(`订阅ID${sub.id} 解析失败，尝试重试，第${count}次`)
                return dowmload.common(sub, config, count)
            }
            if (error.response) {
                if (error.response.status == 400 && error.response.data == "No nodes were found!") {
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("没有任何节点数据，检查链接或者链接已经失效")
                    console.log(`当前订阅地址为${sub.url}`)
                    console.log(`当前请求地址为${url}`)
                }
                else if (error.response.status == 404) {
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                    console.log("请求转换服务器失败")
                } 
            } else {
                console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                console.log("————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————")
                console.log("解析失败,请检查转换服务器和订阅链接")
                console.log(`当前订阅地址为${sub.url}`)
                console.log(`当前请求地址为${url}`)

            }
            return false
        }
    }
}





module.exports = async (config) => {
    const sub_list = config.$config.SubList
    // var proxies=[]
    console.log("***********开始下载所有订阅***************");
    for (const sub of sub_list) {

        if (sub.enabled) {
            const fn = dowmload[`dowmload_id_${sub.id}`] ? dowmload[`dowmload_id_${sub.id}`] : dowmload.common
            const sub_content = await fn(sub, config)
            if (sub_content) {
                console.log(`订阅ID:${sub.id}下载成功`);
                saveToFile(sub, sub_content)
            }
        }
    }
}

