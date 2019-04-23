#!/usr/bin/env node
const prompts = require('prompts')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const copy = require('recursive-copy')
const debug = require('debug')('m10-cli')

// args
const argv = require('yargs')
  .command('new <dir>', 'Create a new m10 based project')
  .help()
  .demandCommand(1).argv

// return pretty error without stacktrace
function cleanError (msg) {
  console.error('Error: ' + msg)
  return process.exit(1)
}

async function main () {
  function onCancel (prompt, response) {
    console.log('Exiting...')
    process.exit(0)
  }
  if (argv.dir && argv._.indexOf('new') > -1) {
    let pathDir = path.resolve(argv.dir)
    let dirExists = true
    try {
      fs.lstatSync(pathDir).isDirectory()
      dirExists = true
    } catch (e) {
      dirExists = false
    }
    if (dirExists === true) {
      return cleanError(
        `Directory ${pathDir} already exists, please delete it and try again or choose a different one`
      )
    }
    let cleanRegex = /[^\w.\-\_]+/g
    let cleanProjectName = argv.dir.replace(cleanRegex, '-')
    console.log(`> Folder: ${pathDir}`)

    let setup = await prompts(
      [
        {
          type: 'text',
          name: 'projectName',
          message: 'Project name',
          initial: cleanProjectName,
          validate: value =>
            value.match(cleanRegex) === null
              ? true
              : 'Only alphanumeric . - _ allowed'
        },
        {
          type: 'confirm',
          name: 'mongodb',
          message: 'Add mongodb support?'
        }
      ],
      { onCancel }
    )

    // copy
    await copy(path.join(__dirname, './templates/starter'), pathDir)
    // change custom files with options
    let filesToCompile = ['package.json', 'app.js']
    for (let i = 0; i < filesToCompile.length; i++) {
      let f = filesToCompile[i]
      let p = `${pathDir}/${f}`
      let r = await ejs.renderFile(p, setup)
      fs.writeFileSync(p, r)
    }
    console.log('> Done!\nNow run:')
    console.log(`cd ${pathDir} && npm install`)
  }
}

main()
