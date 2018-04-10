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
  .command('xls2csv <src> <dist>', 'convert files from xls to csv')
  .command('encode2utf8 <src> <dist>', 'encode files to utf-8 with specific encoding')
  .command('mergecsv2i18ncsv <src> <dist>', 'merge csv files (convert from po2csv) into a i18n format (writer wanted) csv file')
  .command('i18ncsv2csv <i18ncsv src> <dist>', 'convert i18n csv to origin csv files')
  .parse(process.argv)