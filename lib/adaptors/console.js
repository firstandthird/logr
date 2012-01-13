var aug = require('aug');
var c = require('colors');
var strf = require('strf');

var colors = [
  'blue',
  'green',
  'magenta',
  'yellow',
  'cyan'
  //'white'
  //'red',
  //'grey',
];

var lastColor = -1;
var moduleColors = {};
var getModuleColor = function(mod) {
  if (!moduleColors[mod]) {
    if (lastColor == colors.length-1)
      lastColor = -1;
    moduleColors[mod] = colors[++lastColor];
  }
  return moduleColors[mod];
};

module.exports = function(options) {
  var opts = {
    color: true,
    timestamp: true
  };
  aug(opts, options);
  return function(name, level, message, data) {
    var obj = {
      time: new Date().toLocaleTimeString(),
      name: name,
      level: level,
      message: message,
      data: (data)?JSON.stringify(data):''
    };
    if (opts.color) {
      obj.time = obj.time.grey;
      obj.name = c[getModuleColor(name)](obj.name).bold;
      obj.message = obj.message.white;
      obj.data = obj.data.grey;
    }
    console.log(strf('{time} - {name} - {level} - {message} {data}', obj));
  };
};
