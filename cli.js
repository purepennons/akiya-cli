#!/usr/bin/env node

const program = require('commander')

let version

try {
  version = require('./package.json').version
} catch (err) {
  version = 'development'
}

program
  .version(version, '-v, --version')
  .command('xls2csv <src> <dist>', 'convert a file from xls to csv')
  .parse(process.argv)