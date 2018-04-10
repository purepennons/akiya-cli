const R = require('ramda');
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const glob = require('glob');
const csv = require('csvtojson');
const EventEmitter = require('events');
const execSync = require('child_process').execSync;
const Json2csvParser = require('json2csv').Parser;

const localeMapping = {
  en: 'ENG',
  zh_TW: 'CHT',
  zh_CN: 'CHS',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  hu: 'Hungarian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  no: 'Norwegian',
  pl: 'Polish',
  pt: 'Portuguese (Brazil)',
  ro: 'Romanian',
  ru: 'Russian',
  es: 'Spanish (Latin)',
  sv: 'Swedish',
  th: 'Thai',
  tr: 'Turkish'
};

const i18nKeyToCSV = R.cond([
  [R.equals('en'), R.always('ENG')],
  [R.equals('zh_TW'), R.always('CHT')],
  [R.equals('zh_CN'), R.always('CHS')],
  [R.equals('cs'), R.always('Czech')],
  [R.equals('da'), R.always('Danish')],
  [R.equals('nl'), R.always('Dutch')],
  [R.equals('fi'), R.always('Finnish')],
  [R.equals('fr'), R.always('French')],
  [R.equals('de'), R.always('German')],
  [R.equals('el'), R.always('Greek')],
  [R.equals('hu'), R.always('Hungarian')],
  [R.equals('it'), R.always('Italian')],
  [R.equals('ja'), R.always('Japanese')],
  [R.equals('ko'), R.always('Korean')],
  [R.equals('no'), R.always('Norwegian')],
  [R.equals('pl'), R.always('Polish')],
  [R.equals('pt'), R.always('Portuguese (Brazil)')],
  [R.equals('ro'), R.always('Romanian')],
  [R.equals('ru'), R.always('Russian')],
  [R.equals('es'), R.always('Spanish (Latin)')],
  [R.equals('sv'), R.always('Swedish')],
  [R.equals('th'), R.always('Thai')],
  [R.equals('tr'), R.always('Turkish')],
  [R.T, R.identity]
]);

const i18nLanguageTransfer = R.cond([
  [R.equals('ENG'), R.always('en')],
  [R.equals('CHT'), R.always('zh_TW')],
  [R.equals('CHS'), R.always('zh_CN')],
  [R.equals('Czech'), R.always('cs')],
  [R.equals('Danish'), R.always('da')],
  [R.equals('Dutch'), R.always('nl')],
  [R.equals('Finnish'), R.always('fi')],
  [R.equals('French'), R.always('fr')],
  [R.equals('German'), R.always('de')],
  [R.equals('Greek'), R.always('el')],
  [R.equals('Hungarian'), R.always('hu')],
  [R.equals('Italian'), R.always('it')],
  [R.equals('Japanese'), R.always('ja')],
  [R.equals('Korean'), R.always('ko')],
  [R.equals('Norwegian'), R.always('no')],
  [R.equals('Polish'), R.always('pl')],
  [R.equals('Portuguese (Brazil)'), R.always('pt')],
  [R.equals('Romanian'), R.always('ro')],
  [R.equals('Russian'), R.always('ru')],
  [R.equals('Spanish (Latin)'), R.always('es')],
  [R.equals('Swedish'), R.always('sv')],
  [R.equals('Thai'), R.always('th')],
  [R.equals('Turkish'), R.always('tr')],
  [R.T, R.identity]
]);

program.parse(process.argv);

const args = program.args;

if (args.length < 2) {
  console.error('too less arguments');
  process.exit(1);
}
console.log();

const pattern = args[0];
const dist = args[1];

// main process
let srcType = '';
try {
  const lstat = fs.lstatSync(pattern);
  srcType = lstat.isDirectory() ? 'directory' : 'file';
} catch (err) {
  console.error('source is not exist');
  process.exit(1);
}

const srcBase = path.resolve(pattern);
const baseDist = path.resolve(dist);
const emitter = new EventEmitter();

const files = glob.sync(`${srcBase}/*/messages.csv`, {
  mark: true,
  absolute: true,
  nodir: true
});

const csvs = {};

const langs = files.map(file => {
  const lang = path
    .parse(file)
    .dir.split('/')
    .reverse()[0];

  csv({ noheader: false, headers: ['location', 'source', 'target'] })
    .fromFile(file)
    .on('json', obj => {
      if (!csvs[obj.source]) csvs[obj.source] = {};
      csvs[obj.source]['ID'] = obj.source;
      csvs[obj.source][i18nKeyToCSV(lang)] = obj.target;
    })
    .on('done', err => emitter.emit('csv'));

  return lang;
});

let counts = 0;
emitter.on('csv', () => {
  counts++;
  if (counts < files.length) return;
  const usedLocales = langs.map(lang => i18nKeyToCSV(lang));
  const fields = ['ID', ...usedLocales];
  const opts = { fields };

  try {
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(Object.values(csvs));
    fs.writeFileSync(baseDist, csv)
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
