'use strict';
const stringify = require('json-stringify-safe');
const aug = require('aug');

module.exports = function(config, tags, message) {
  if (config.jsonOptions.tagsObject) {
    const tagsObj = {};
    tags.forEach((tag) => {
      tagsObj[tag] = true;
    });
    tags = tagsObj;
  }
  let out = {
    timestamp: new Date(),
    tags,
    message
  };
  out = aug(out, config.jsonOptions.additional);
  return stringify(out);
};
