'use strict';
var fs = require('fs'),
    path = require('path');
function ls(folder) {
  return fs.readdirSync(folder).map(i => path.join(folder, i));
}

function last(arr) {
  return arr[arr.length-1];
}

function splitpath(str) {
  return str.split(path.sep);
}

function basename(str) {
  return last(splitpath(str));
}

function deleteIfEmptyFolder(folder, options) {
  if (!fs.existsSync(folder)) {
    return;
  }
  var stat = fs.lstatSync(folder);
  if (!stat.isDirectory()) {
    return;
  }
  var contents = ls(folder);

  if (options.deleteFolderJpg &&
      contents.length === 1 &&
      basename(contents[0]).toLowerCase() === 'folder.jpg') {
    fs.unlinkSync(contents[0]);
  }
  contents.forEach(c => deleteIfEmptyFolder(c, options));
  contents = ls(folder);
  if (contents.length) {
    return;
  }

  fs.rmdirSync(folder);
}

function sweep(base, options) {
  var contents = ls(base);
  options = options || {};
  contents.forEach(o => deleteIfEmptyFolder(o, options));
}

module.exports = sweep;
