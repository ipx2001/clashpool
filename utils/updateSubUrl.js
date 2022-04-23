const moment = require("moment")
const request = require("./request");
/**
 * 这个文件负责检查订阅更新，update里的对象，和ID对应，如果有则执行
 */
const update = {
    //更新id22
    async up_id_22() {
        const url = `https://raw.githubusercontent.com/pojiezhiyuanjun/freev2/master/${moment().format("MMDD")}.txt`
        try {
            const res = await request({ url })
            return url
        } catch (error) {
            return false
        }
    },
    async up_id_23(sub) {
        // const url = `https://www.mattkaydiary.com/${moment("2022-04-17").format("YYYY/MM/YYYY-MM-DD")}-free-v2ray-clash-nodes.html`
        //这个页面已经固定链接地址了
        const url = `https://www.mattkaydiary.com/2022/03/2022-03-11-free-v2ray-clash-nodes.html`
        try {
            const res = await request({ url })
            const sub_url = res.data.split("v2ray(请开启代理后再拉取)&#65306;")[1].split("</div>")[0].replace(/&amp;/g, '&')
            if (sub.url == sub_url) return false
            return sub_url
        } catch (error) {
            return false
        }
    },
    async up_id_24() {
        const url = `https://raw.githubusercontent.com/FMYC2015/V2ray/main/${moment().format("YYYY/YYYY-MM-DD")}`
        try {
            const res = await request({ url })
            return url
        } catch (error) {
            return false
        }
    }

}



module.exports = async (config) => {
    const sub_list = config.$config.SubList
    for (const sub of sub_list) {
        const fn = update[`up_id_${sub.id}`]
        if (fn) {
            console.log(`正在更新ID:${sub.id}的订阅链接`);
            const url = await fn(sub, config)
            if (url) {
                sub.url = url
                sub.enabled = true
                sub.lastUpdateTime = moment().format("YYYY-MM-DD")
                console.log(`获取订阅地址成功,地址为:${url}`);
            } else {
                sub.enabled = false
                console.log(`获取订阅地址失败,还未更新或已经失效,上次更新的时间${sub.lastUpdateTime}`);
            }
        }
    }
    config.$config.SubList = sub_list
    return sub_list
}
module.exports.update = update
