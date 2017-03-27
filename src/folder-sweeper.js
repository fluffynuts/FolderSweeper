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

function folderOnlyContainsDeletables(folder, options) {
  var contents = ls(folder);
  return contents.reduce((acc, cur) => {
    return acc && options.deletables.indexOf(basename(cur).toLowerCase()) > -1;
  }, true);
}

function deleteDeletablesIn(folder, options) {
  var toDelete = ls(folder).filter(item => {
                    var fname = basename(item);
                    return options.deletables.indexOf(fname.toLowerCase()) > -1;
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
  var contents = ls(folder);
  contents.forEach(c => deleteIfEmptyFolder(c, options));
  if (options.deletables.length &&
      folderOnlyContainsDeletables(folder, options)) {
    deleteDeletablesIn(folder, options);
  }
  contents = ls(folder);
  if (folderOnlyContainsDeletables(folder, options)) {
    log(options, `rmdir: ${folder}`);
  }
  if (contents.length) {
    return;
  }

  rmdir(folder, options);
}


function rmdir(folder, options) {
  log(options, `rmdir: ${folder}`);
  if (options['dry-run']) {
    return;
  }
  fs.rmdirSync(folder);
}

function log(options, message) {
  if (options['verbose']) {
    console.log(message);
  }
}

function unlink(file, options) {
  log(options, `unlink: ${file}`);
  if (options['dry-run']) {
    return;
  }
  fs.unlinkSync(file);
}

function determineDeletablesFrom(options) {
  var deletables = (options['unimportant-files'] || '').split(',')
  if (options['folder-jpg']) {
    deletables.push('folder.jpg');
  }
  if (options['view-xml']) {
    deletables.push('view.xml');
  }
  return deletables.map(d => d.toLowerCase());
}

function sweep(base, options) {
  var contents = ls(base);
  options = options || {};
  if (options['dry-run']) {
    options['verbose'] = true;
  }
  options.deletables = determineDeletablesFrom(options);
  contents.forEach(o => deleteIfEmptyFolder(o, options));
}
sweep.options = {
  'folder-jpg': ['j', 'Remove folder.jpg too'],
  'view-xml': ['x', 'Remove view.xml too'],
  'unimportant-files': ['u', 'Comma-separated list of files that, without other files, imply that a folder is empty', 'string'],
  'dry-run': ['d', 'Just report what would be done; don\'t actually do it'],
  'verbose': ['v', 'Report on actions taken']
};

module.exports = sweep;
