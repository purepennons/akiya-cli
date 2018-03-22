const fs = require('fs-extra');
const path = require('path');
const iconv = require('iconv-lite');
const program = require('commander');
const glob = require('glob');
const execSync = require('child_process').execSync;

function convertFile(src, dist, charset, encode = 'utf8') {
  fs
    .createReadStream(src)
    .pipe(iconv.decodeStream(charset))
    .pipe(iconv.encodeStream(encode))
    .pipe(fs.createWriteStream(dist));
}

program
  .option('-c, --charset <charset>', 'set decoder')
  .option('-e, --ext [extension]', 'specific file extensions (e.g. {csv,txt})')
  .parse(process.argv);

const args = program.args;

if (args.length < 2) {
  console.error('too less arguments');
  process.exit(1);
}
console.log();

if (!program.charset) {
  console.error('must specific a charset');
  process.exit(1);
}

const pattern = args[0];
const dist = args[1];
const charset = program.charset;
const ext = program.ext || '';

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

if (srcType === 'file') {
  const dir = path.parse(baseDist).dir;

  //ensure dir
  fs.mkdirsSync(dir);
  convertFile(srcBase, baseDist, charset, 'utf8');
} else {
  const globPattern = ext ? `${pattern}/**/*.${ext}` : `${pattern}/**/*`;
  const files = glob.sync(globPattern, {
    mark: true,
    absolute: true,
    nodir: true
  });
  files.forEach(file => {
    try {
      const outFilePath = path.resolve(
        `${baseDist}/${file.split(srcBase).join('')}`
      );
      const outDirPath = path.parse(outFilePath).dir;

      // ensure base output dir
      fs.mkdirsSync(outDirPath);

      // convert
      convertFile(file, outFilePath, charset, 'utf8');
    } catch (err) {
      console.error('path parsing or executing error', err);
    }
  });
}
