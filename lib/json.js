'use strict';
const stringify = require('json-stringify-safe');
const _ = require('lodash');

module.exports = function(options, tags, message) {
  if (options.tagsObject) {
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
  out = _.mergeWith(out, options.additional);
  return stringify(out);
};
