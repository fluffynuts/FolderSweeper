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

function folderOnlyContainsFolderJpg(folder) {
  var contents = ls(folder);
  return contents.length === 1 &&
          basename(contents[0]).toLowerCase() === 'folder.jpg';
}

function deleteFolderJpgIn(folder, options) {
  var toDelete = ls(folder).filter(item => {
                    var fname = basename(item);
                    return fname.toLowerCase() === 'folder.jpg';
                  });
  toDelete.forEach(d => unlink(d, options));
}

function deleteIfEmptyFolder(folder, options) {
  if (!fs.existsSync(folder)) {
    return;
  }
  var stat = fs.lstatSync(folder);
  if (!stat.isDirectory()) {
    return;
  }
  if (options['folder-jpg'] &&
      folderOnlyContainsFolderJpg(folder)) {
    deleteFolderJpgIn(folder, options);
  }
  var contents = ls(folder);
  contents.forEach(c => deleteIfEmptyFolder(c, options));
  contents = ls(folder);
  if (contents.length) {
    if (options['dry-run'] &&
        folderOnlyContainsFolderJpg(folder)) {
      console.log('rmdir: ' + folder);
    }
    return;
  }

  rmdir(folder, options);
}

function rmdir(folder, options) {
  if (options['dry-run']) {
    console.log('rmdir: ' + folder);
  } else {
    fs.rmdirSync(folder);
  }
}

function unlink(file, options) {
  if (options['dry-run']) {
    console.log('unlink: ' + file);
  } else {
    fs.unlinkSync(file);
  }
}

function sweep(base, options) {
  var contents = ls(base);
  options = options || {};
  contents.forEach(o => deleteIfEmptyFolder(o, options));
}

module.exports = sweep;
