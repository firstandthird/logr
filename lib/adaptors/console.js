var aug = require('aug');
var c = require('colors');

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

var getLevelColor = function(level) {
  return 'grey'; //tmp for now
};

module.exports = function(options) {
  var opts = {
    color: true,
    timestamp: true
  };
  aug(opts, options);
  return function(name, section, level, message, data) {
    if (data)
      data = JSON.stringify(data);
    var out = '';
    out += (opts.timestamp)?new Date().toLocaleTimeString() + ' ':'';
    out += (opts.color)?c[getLevelColor(level)](level):level;
    out += ' - ';
    out += (opts.color)?c[getModuleColor(name)](name).bold:name;
    out += ' ';
    if (section) {
      out += '[';
      out += (opts.color)?c[getModuleColor(section)](section).bold:section;
      out += '] ';
    }
    out += '- ';
    out += (opts.color)?message.white:message;
    out += ' ';
    if (data)
      out += (opts.color)?data.grey:data;

    console.log(out);
  };
};
