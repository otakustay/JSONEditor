var fs = require('fs');
var path = require('path');
var targetDirectory = process.argv[3] || '..';
var themeName = process.argv[2] || 'theme' + (+new Date);
var filename = path.join(targetDirectory, themeName + '.css');

console.log('正在加载模板...');
var template = fs.readFileSync('template.css', 'utf8');
console.log('制作皮肤...');
var content = template.replace(/\{name\}/g, themeName);
fs.writeFileSync(filename, content);
console.log('皮肤制作成功，保存于' + filename);