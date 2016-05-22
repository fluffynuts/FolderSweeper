#!/usr/bin/env node
var sweeper = require('./src/folder-sweeper'),
    cli = require('cli');
cli.parse({
  'folder-jpg': ['j', 'Remove folder.jpg too'],
  'dry-run': ['d', 'Just report what would be done; don\'t actually do it']
});

cli.main((args, options) => {
  if (options['dry-run']) {
    console.log('Dry-run: will only log actions to be taken');
  }
  args.forEach(a => sweeper(a, options));
});
