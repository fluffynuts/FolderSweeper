#!/usr/bin/env node
var sweeper = require('./src/folder-sweeper'),
    cli = require('cli');
cli.enable('glob');
cli.parse({
  'folder-jpg': ['j', 'Remove folder.jpg too'],
  'dry-run': ['d', 'Just report what would be done; don\'t actually do it']
});

cli.main((args, options) => {
  if (options['dry-run']) {
    console.log('Dry-run: will only log actions to be taken');
  }
  if (args.length === 0) {
    console.log('no folders specified');
  }
  args.forEach(a => sweeper(a, options));
});
