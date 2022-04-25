const yaml = require("yaml");
const path = require("path")
const fs = require("fs");
const geoip = require("geoip-lite")
const dns = require("dns");
const Clash = require("./ClashApi");
const results_config = require("./template.json")

//数组去重的方法
function unique(arr) {
    let result = {};
    let finalResult = [];
    for (let i = 0; i < arr.length; i++) {
        result[arr[i].server] = arr[i];
    }
    for (item in result) {
        finalResult.push(result[item]);
    }
    return finalResult;
}

module.exports = async (config) => {
    var proxies = []
    const sub_list = config.$config.SubList
    for (const sub of sub_list) {
        if (sub.enabled) {
            try {
                const sub_content = fs.readFileSync(`./temp/${sub.id}.yaml`, "utf8").replace(/!<str>/g, '')
                const yaml_sub = yaml.parse(sub_content)
                proxies = proxies.concat(yaml_sub.proxies)
            } catch (error) {
                console.log(`合并订阅${sub.id}失败`, error);
            }
        }
    }
    console.log(`节点合并完成，共${proxies.length}个`);
    proxies = unique(proxies)
    console.log(`节点去重完成，共${proxies.length}个`);
    var yaml_config = {
        proxies: [],
        "proxy-groups": [{
            name: "所有节点",
            type: "select",
            proxies: []
        }]
    }
    proxies.forEach((proxie, index) => {
        proxie.name = index
        yaml_config.proxies.push(proxie)
        yaml_config["proxy-groups"][0].proxies.push(index)
    });
    console.log(`共${yaml_config.proxies.length}个节点，写入文件:./temp/nodes.yaml`);
    fs.writeFileSync(`./temp/nodes.yaml`, yaml.stringify(yaml_config))
   
    console.log(`*******************开始测速**************************`);
    var proxies_list = []
    async function lookup(server) {
        return new Promise((resolve, reject) => {
            dns.lookup(server, function (err, address) {
                resolve({ err, address })
            })
        })
    }
    const emoji = {
        'US': ['🇺🇸', "美国"], 'HK': ['🇭🇰', "香港"], 'SG': ['🇸🇬', "新加坡"],
        'JP': ['🇯🇵', "日本"], 'TW': ['🇹🇼', "台湾"], 'CA': ['🇨🇦', "加拿大"],
        'GB': ['🇬🇧', "英国"], 'CN': ['🇨🇳', "中国"], 'NL': ['🇳🇱', "荷兰"],
        'TH': ['🇹🇭', "泰国"], 'BE': ['🇧🇪', "比利时"], 'IN': ['🇮🇳', '印度'],
        'IT': ['🇮🇹', "意大利"], 'DE': ['🇩🇪', "德国"], 'PE': ['🇵🇪', '秘鲁'], 'RO': ['🇷🇴', '罗马尼亚'],
        'AU': ['🇦🇺', '澳大利亚'], 'RU': ['🇷🇺', '俄罗斯'],
        'KR': ['🇰🇷', '韩国'], 'DK': ['🇩🇰', '丹麦'], 'PT': ['🇵🇹', '葡萄牙'],
        'FR': ['🇫🇷', '法兰西'], 'ES': ['🇪🇸', '西班牙'],
        'VN': ['🇻🇳', '越南'],
        'CH': ['🇨🇭', '瑞士'], 'BG': ['🇧🇬', '保加利亚'], 'ZA': ['🇿🇦', '南非'],
        'RELAY': ['🌏', '中转'],
        'NOWHERE': ['🌐', '未知'],
    }
    await Clash.setConfigs(path.join(process.cwd(), "/temp/nodes.yaml"))
    for (const proxie of yaml_config.proxies) {
        console.log(`正在测速---(${proxie.name}/${yaml_config.proxies.length})---当前有效节点数${proxies_list.length}`);
        if (proxie.server != "localhost" || proxie.server != "127.0.0.1") {
            try {
                const res = await Clash.getDelay(proxie.name, 5000)
                proxies_list.push({
                    delay: res.data.delay,
                    proxie
                })
            } catch (error) {
                if (error.response) {
                    if (error.response.status == 504 && error.response.data.message == "Timeout") {
                        console.log(`${error.response.data.message} 节点${proxie.name}超时，剔除此节点`);
                    }
                }
            }
        }
    }
    console.log(`测速完成，共${proxies_list.length}个有效节点`);
    console.log(`*******************开始排序和重命名**************************`);
    proxies_list = proxies_list.sort((a, b) => {
        return a.delay - b.delay
    })
    var AreaGroups = {
        "美区": [],
        "德区": [],
        "日区": [],
        "港区": [],
        "新加坡": [],
        "中国": [],
        "其他": [],
    }
    console.log(`排序完成，准备获取节点区域，进行重命名`);
    let i = 0
    for (const { proxie } of proxies_list) {

        i++
        // console.log(`重命名中---(${i}/${proxies_list.length})`);
        let area = "其他";
        //重命名
        const { err, address } = await lookup(proxie.server)
        if (!err) {
            const lookup = geoip.lookup(address)
            if (lookup != null) {
                let name_emoji;
                if (emoji[lookup.country]) {
                    name_emoji = emoji[lookup.country][0]
                    nation = emoji[lookup.country][1]
                } else {
                    name_emoji = emoji["NOWHERE"][0]
                    nation = emoji["NOWHERE"][1]
                }
                switch (lookup.country) {
                    case "US":
                        area = "美区"
                        break;
                    case "DE":
                        area = "德区"
                        break;
                    case "JP":
                        area = "日区"
                        break;
                    case "HK":
                        area = "港区"
                        break;
                    case "SG":
                        area = "新加坡"
                        break;
                    case "CN":
                        area = "中国"
                        break;
                    default:
                        area = "其他"
                        break;
                }
                // HTTP|🇺🇸美国 001 
                proxie.name = `${name_emoji}${proxie.type.toUpperCase()}|${nation} ${(AreaGroups[area].length + 1).toString().padStart(3, "0")}`
            } else {
                proxie.name = `${emoji["NOWHERE"][0]}${proxie.type.toUpperCase()}|${emoji["NOWHERE"][1]} ${(AreaGroups['其他'].length + 1).toString().padStart(3, "0")}`
            }
            AreaGroups[area].push(proxie)
        }

    }

    console.log(`****************格式化输出配置*****************`);
    for (let Area in AreaGroups) {
        if (AreaGroups[Area].length > 0) {
            const Groups = {
                name: Area,
                type: "url-test",
                url: "https://www.google.com/gen_204",
                interval: 180,
                proxies: []
            }
            AreaGroups[Area].forEach(proxie => {
                results_config.proxies.push(proxie)
                Groups.proxies.push(proxie.name)
                results_config['proxy-groups'][1].proxies.push(proxie.name)
                results_config['proxy-groups'][2].proxies.push(proxie.name)

            });
            results_config['proxy-groups'][0].proxies.push(Area)
            results_config['proxy-groups'].push(Groups)
        }
    }
    fs.writeFileSync(`./sub/clash.yaml`, yaml.stringify(results_config))

}


