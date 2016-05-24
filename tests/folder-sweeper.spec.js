var expect = require('chai').expect,
    path = require('path');
    temp = require('temp'),
    sinon = require('sinon'),
    sut = require('../src/folder-sweeper'),
    fs = require('fs');

describe('folder-sweeper', () => {
  var sandbox;
  temp.track();
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    temp.cleanupSync();
    sandbox.restore();
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

  it('should delete a folder containing nested folder.jpg if given options with "folder-jpg" == true', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder =  path.join(base, 'first-level');
    fs.mkdirSync(folder);
    folder = path.join(folder, 'not-empty');
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

  it('should delete a folder containing nested view.xml if given options with "view-xml" == true', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder =  path.join(base, 'first-level');
    fs.mkdirSync(folder);
    folder = path.join(folder, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'view.xml');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    var opts = { "view-xml": true };
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file)).to.be.false;
    expect(fs.existsSync(folder)).to.be.false;
  });


  it('should NOT delete a folder containing folder.jpg if given options with "folder-jpg" == true and "dry-run" == true', () => {
    // Arrange
    var stub = sandbox.stub(console, 'log');
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
    expect(stub).to.have.been.called;
  });

  it('should delete a folder containing nested folder.jpg if given options with "unimportant-files" == "Folder.jpg (ie, case-insensitive)', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder =  path.join(base, 'first-level');
    fs.mkdirSync(folder);
    folder = path.join(folder, 'not-empty');
    fs.mkdirSync(folder);
    var file = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file, 'some data');
    expect(fs.lstatSync(file).isFile()).to.be.true;
    // Act
    var opts = { 'unimportant-files': 'Folder.jpg' }
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file)).to.be.false;
    expect(fs.existsSync(folder)).to.be.false;
  });

  it('should delete a folder containing nested files specified by "unimportant-files" comma-separated list', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder =  path.join(base, 'first-level');
    fs.mkdirSync(folder);
    folder = path.join(folder, 'not-empty');
    fs.mkdirSync(folder);
    var file1 = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file1, 'some data');
    expect(fs.lstatSync(file1).isFile()).to.be.true;
    var file2 = path.join(folder, 'view.xml');
    fs.writeFileSync(file2, 'some data');
    expect(fs.lstatSync(file2).isFile()).to.be.true;
    // Act
    var opts = { "unimportant-files": 'Folder.jpg,view.xml' }
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file1)).to.be.false;
    expect(fs.existsSync(file2)).to.be.false;
    expect(fs.existsSync(folder)).to.be.false;
  });

  it('should have an options property with the dry-run option', () => {
    // Arrange
    var opts = sut.options;
    // Act
    expect(opts).not.to.be.undefined;
    var result = opts['dry-run'];
    // Assert
    expect(result).not.to.be.undefined;
    expect(result[0]).to.equal('d');
    expect(result[1]).not.to.be.undefined;
    
  });

  it('should have an options property with the unimportant-files option', () => {
    // Arrange
    var opts = sut.options;
    // Act
    expect(opts).not.to.be.undefined;
    var result = opts['unimportant-files'];
    // Assert
    expect(result).not.to.be.undefined;
    expect(result[0]).to.equal('u');
    expect(result[1]).not.to.be.undefined;
    expect(result[2]).to.equal('string');
  });

  it('should have an options property with the view-xml option', () => {
    // Arrange
    var opts = sut.options;
    // Act
    expect(opts).not.to.be.undefined;
    var result = opts['view-xml'];
    // Assert
    expect(result).not.to.be.undefined;
    expect(result[0]).to.equal('x');
    expect(result[1]).not.to.be.undefined;
    
  });

  it('should have an options property with the folder-jpg option', () => {
    // Arrange
    var opts = sut.options;
    // Act
    expect(opts).not.to.be.undefined;
    var result = opts['folder-jpg'];
    // Assert
    expect(result).not.to.be.undefined;
    expect(result[0]).to.equal('j');
    expect(result[1]).not.to.be.undefined;
    
  });

  it('should delete a tree of folders only containing deletables', () => {
    // Arrange
    var base = temp.mkdirSync();
    var folder =  path.join(base, 'first-level');
    fs.mkdirSync(folder);
    var file1 = path.join(folder, 'folder.jpg');
    fs.writeFileSync(file1, 'some data');
    expect(fs.lstatSync(file1).isFile()).to.be.true;
    folder = path.join(folder, 'not-empty');
    fs.mkdirSync(folder);
    var file2 = path.join(folder, 'view.xml');
    fs.writeFileSync(file2, 'some data');
    expect(fs.lstatSync(file2).isFile()).to.be.true;
    // Act
    var opts = { "unimportant-files": 'Folder.jpg,view.xml' }
    sut(base, opts);
    // Assert
    expect(fs.existsSync(file1)).to.be.false;
    expect(fs.existsSync(file2)).to.be.false;
    expect(fs.existsSync(folder)).to.be.false;
  })
});
