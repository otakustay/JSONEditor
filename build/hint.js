var fs = require('fs');
var path = require('path');
var fileset = require('./fileset.js');
var hintConfig = require('./modules/hint-config.js');

console.log(fileset.core.concat('--config modules/hint-config.js'));
var proc = require('child_process').spawn('jshint', fileset.core.concat('--config modules/hint-config.js'));

proc.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

// proc.stderr.on('data', function (data) {
//   console.log('stderr: ' + data);
// });

proc.on('exit', function (code) {
  console.log('child process exited with code ' + code);
});