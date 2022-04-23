const config = require("./utils/config")
const updateSubUrl = require('./utils/updateSubUrl')
const downSub= require('./utils/downSub')
const mergeSub = require('./utils/mergeSub')
startUpCheck()

async function start (){
    // await  updateSubUrl(config)
    // await  downSub(config)
    await mergeSub(config);
  }

  start ()
//启动时检查必要条件
function startUpCheck() {
    let sub_ids = {}
    config.$config.SubList.forEach(sub => {
        if (sub_ids[sub.id]) {
            throw new Error("订阅ID不能重复，必须独一无二")
        }
        sub_ids[sub.id] = sub
    })
}