var expect = require('chai').expect,
    path = require('path');
    temp = require('temp'),
    sut = require('../src/folder-sweeper'),
    fs = require('fs');

describe('folder-sweeper', () => {
  temp.track();
  afterEach(() => {
    temp.cleanupSync();
  });
  it('should be a function', () => {
    // Arrange
    // Act
    // Assert
    expect(typeof(sut)).to.equal('function');
  });

  it('should do nothing if given an empty folder as the base', () => {
    // Arrange
    var dir = temp.mkdirSync();
    expect(fs.readdirSync(dir)).to.have.length(0);
    // Act
    sut(dir);
    // Assert
    expect(fs.existsSync(dir)).to.be.true;
    expect(fs.readdirSync(dir)).to.have.length(0);
  });

  it('should delete the single empty folder from the base', () => {
    // Arrange
    var base = temp.mkdirSync();
    var emptyFolder = path.join(base, 'empty');
    fs.mkdirSync(emptyFolder);
    expect(fs.existsSync(emptyFolder)).to.be.true;
    // Act
    sut(base);
    // Assert
    expect(fs.existsSync(emptyFolder)).to.be.false;
  });

  it('should not delete a folder with an arbitrary file in it', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder = path.join(base, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'somefile.txt');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    sut(base);
    // Assert
    expect(fs.lstatSync(file).isFile()).to.be.true;
  });

  it('should delete a folder with an empty folder in it', () => {
    // Arrange
    var base = temp.mkdirSync();
    var firstFolder = path.join(base, 'some-folder');
    var secondFolder = path.join(firstFolder, 'another-folder');
    fs.mkdirSync(firstFolder);
    fs.mkdirSync(secondFolder);
    expect(fs.lstatSync(secondFolder).isDirectory()).to.be.true;
    // Act
    sut(base);
    // Assert
    expect(fs.existsSync(secondFolder)).to.be.false;
  });

  it('should not delete a folder containing folder.jpg if given no options', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder = path.join(base, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    sut(base);
    // Assert
    expect(fs.existsSync(file)).to.be.true;
  });

  it('should not delete a folder containing folder.jpg if given options with "folder-jpg" == false', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder = path.join(base, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    sut(base, { "folder-jpg": false });
    // Assert
    expect(fs.existsSync(file)).to.be.true;
  });

  it('should delete a folder containing folder.jpg if given options with "folder-jpg" == true', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder = path.join(base, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    var opts = { "folder-jpg": true };
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file)).to.be.false;
    expect(fs.existsSync(folder)).to.be.false;
  });

  it('should NOT delete a folder containing folder.jpg if given options with "folder-jpg" == true and "dry-run" == true', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder = path.join(base, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    var opts = { "folder-jpg": true, "dry-run": true };
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file)).to.be.true;
    expect(fs.existsSync(folder)).to.be.true;
  });

});
