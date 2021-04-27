let fs = require('fs')
let path = require('path')
let { program } = require('commander')
let childProcess = require('child_process')

program.version('0.0.1')
  .option('-p, --path <string>', 'Path of the directory of the thrift files.')
  .option('-o, --out <string>', 'Path of the directory of the output files.')

program.parse(process.argv)
let options = program.opts()

console.log(program)
console.log(options)

if (!options.path) return console.error('Please define the path of the directory of the thrift files\nHelps by gen_model -h')
if (!options.out) {
  console.error('Output directory is not defined. Using default output')
  options.out = './Thrifts/generated'
}

const thriftFileDir = path.resolve(process.cwd(), options.path)
const thriftOutDir = path.resolve(process.cwd(), options.out)
const tempDirectory = path.resolve(thriftOutDir, './auto_generated')
const thriftLoaderDir = path.resolve(thriftOutDir, '_loader.js')
const genToolDir = path.resolve(__dirname, './utils/thrift.exe')
const baseCmd = `"${genToolDir}" -r --gen js:node -out`

let loader = "// Auto-generated by generate-thrift script on " + (new Date()).toString() + "\n\n"

if (!fs.existsSync(thriftOutDir)) {
  fs.mkdirSync(thriftOutDir, { recursive: true })
} else {
  fs.rmdirSync(thriftOutDir, { recursive: true })
  fs.mkdirSync(thriftOutDir, { recursive: true })
}
if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory, { recursive: true })
}

fs.readdirSync(thriftFileDir).forEach(filename => {
  if (!filename.match(/\.thrift$/)) {
    return
  }
  let filenameWithoutExtension = filename.replace('.thrift', '')

  loader += `// ========\n// Generated For ${filename}\n// ========\n`

  loader += 'let generated_export = {}\n'

  let genTempDir = path.resolve(tempDirectory, filenameWithoutExtension)
  if (!fs.existsSync(genTempDir)) {
    fs.mkdirSync(genTempDir)
  }

  let runCmd = `${baseCmd} "${genTempDir}" "${path.resolve(thriftFileDir, filename)}"`

  console.log(`Generating ${filenameWithoutExtension}`)
  childProcess.execSync(runCmd)
  console.log(`Generated ${filenameWithoutExtension} success`)

  // for IDE to fetch the keys
  loader += `generated_export.${filenameWithoutExtension} = { services: {}, types: {} }\n`;

  fs.readdirSync(genTempDir).forEach((fileName) => {
    let relativePath = path.relative(thriftOutDir, path.resolve(genTempDir, fileName)).split(path.sep).join(path.posix.sep)
    if (fileName.indexOf('_types') !== -1) {
      // types
      let typeName = fileName.replace('_types.js', '')
      loader += `generated_export.${filenameWithoutExtension}.types.${typeName} = require('./${relativePath}')\n`;
    } else {
      let serviceName = fileName.replace('.js', '')
      loader += `generated_export.${filenameWithoutExtension}.services.${serviceName} = require('./${relativePath}')\n`;
    }
  })

  loader += '\n\n'
  loader += 'module.exports = generated_export\n'
  loader += '// for TypeScript\n'
  loader += 'module.exports.default = generated_export'
})

console.log("Generating _load.js");
fs.writeFileSync(thriftLoaderDir, loader);