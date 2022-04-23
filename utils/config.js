const yaml = require("yaml");
const moment = require("moment")
const fs = require("fs");
const config_path = "./utils/config.yaml"
const _config = yaml.parse(fs.readFileSync(config_path, "utf8"))




//保存配置
function save() {
  fs.writeFile(config_path, yaml.stringify(_config), 'utf8', function (error) {
    if (error) {
      console.log(error);
      return false;
    }
  })
}
function getConfig(data) {
  return new Proxy(data, {
    set: (target, prop, newValue) => {
      var status = Reflect.set(target, prop, newValue)
      if (status) save()
      return status
    }
  })
}


module.exports = {
  $config: getConfig(_config),

  //保留方法，暂时没有用到
  setSubUrlForID(id, url) {
    let index;
    const SubList = this.$config.SubList
    this.$config.SubList.forEach((sub, i) => {
      if (sub.id == id) {
        sub.url = url
      }
    });
    this.$config.SubList = SubList
  }

}



