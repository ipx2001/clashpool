var child_process = require('child_process');

var echo = child_process.spawn('/home/runner/work/clashpool/clashpool/utils/clash', ['-d',"."]);

echo.stdout.on('data', function(data){
   console.log(data);
});

