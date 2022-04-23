#! /usr/bin/env node
var child_process = require('child_process');

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