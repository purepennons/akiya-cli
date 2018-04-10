const R = require('ramda');
const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const csv = require('csvtojson');
const EventEmitter = require('events');
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

if (srcType === 'directory') {
  console.error('input source must be a i18n csv file')
  process.exit(1)
}

const srcBase = path.resolve(pattern);
const baseDist = path.resolve(dist);
const emitter = new EventEmitter();

const csvs = {}

csv({ noheader: false })
  .fromFile(srcBase)
  .on('json', obj => {
    const id = obj.ID
    if (!id) return
    delete obj.ID
    Object.keys(obj).forEach(locale => {
      const lang = i18nLanguageTransfer(locale)
      if (!csvs[lang]) csvs[lang] = []
      csvs[lang].push({
        location: `.${id}`,
        source: id,
        target: obj[locale],
      })
    })
  })
  .on('done', err => {
    if (err) {
      console.error('error', err)
      process.exit(1)
    } else {
      const fields = ['location', 'source', 'target'];
      const opts = { fields };
      const parser = new Json2csvParser(opts);
      Object.keys(csvs).forEach(lang => {
        const csv = parser.parse(csvs[lang])
        const outDir = path.join(baseDist, lang)
        fs.mkdirsSync(outDir)
        fs.writeFileSync(path.join(outDir, 'messages.csv'), csv)
      })
    }
  })


