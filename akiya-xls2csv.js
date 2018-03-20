const fs = require('fs-extra');
const path = require('path')
const program = require('commander');
const glob = require('glob');
const execSync = require('child_process').execSync;

const xlsx = `node ./node_modules/xlsx/bin/xlsx.njs`;

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

if (srcType === 'file') {
  execSync(`${xlsx} ${pattern} > ${dist}`, {
    stdio: [0, 1, 2]
  })
} else {
  const srcBase = path.resolve(pattern)
  const baseDist = path.resolve(dist)
  const files = glob.sync(`${pattern}/**/*.{xls,xlsx}`, { mark: true, absolute: true, sync: true })
  
  files.forEach(file => {
    try {
      const outFilePath = path.resolve(`${baseDist}/${file.split(srcBase).join('')}`)
      const outDirPath = path.parse(outFilePath).dir
      
      // ensure base output dir
      fs.mkdirsSync(outDirPath)
      
      // convert
      execSync(`${xlsx} ${file} > ${outFilePath}.csv`, {
        stdio: [process.stdin, process.stdout, process.stderr]
      })
    } catch (err) {
      console.error('path parsing or excute error', err)
    }
  })
}