
/**
 * 本来想用node重新写的，后来因为工作忙，直接调用别人写好的  不过是python版本，用子进程实现调用
 */
module.exports = (server, port) => {
    const output = execSync(`python utils/speedtest.py ${server} ${port}`)
    if (output.toString().trim() == "True") {
        return true
    } else {
        return false
    }
}
