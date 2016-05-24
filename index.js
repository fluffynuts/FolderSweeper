#!/usr/bin/env node
var sweeper = require('./src/folder-sweeper'),
    cli = require('cli').enable('glob');

cli.parse(sweeper.options);

cli.main((args, options) => {
  if (options['dry-run']) {
    console.log('Dry-run: will only log actions to be taken');
  }
  if (args.length === 0) {
    console.log('no folders specified');
  }
  args.forEach(a => sweeper(a, options));
});
