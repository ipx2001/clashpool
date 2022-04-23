var child_process = require('child_process');
child_process.execSync("chmod +x /home/runner/work/clashpool/clashpool/utils/clash")
var test= child_process.exec("/home/runner/work/clashpool/clashpool/utils/clash -d .",(err,stdout,stderr)=>{
    if(err){
        console.log(err);
    }
    console.log(stdout);
})


setTimeout(()=>{
    test.kill()
    console.log("000000");
},10000)