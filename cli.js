#!/usr/bin/env node
const prompts = require('prompts')
const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')
const copy = require('recursive-copy')
const concat = require('concat-stream')
const joiMachine = require('joi-machine')
const standard = require('standard')
const yargs = require('yargs')
const debug = require('debug')('m10-cli')
const JOI_BLANK_TEMPLATE = fs
  .readFileSync(path.join(__dirname, './templates/joi-blank'))
  .toString()

// args
const argv = yargs
  .command('new <dir>', 'create a new m10 based project')
  .command(
    'add <type>',
    'add a new route/middleware/validation to this project',
    yargs => {
      yargs.choices('type', ['crud', 'route'])
    }
  )
  .describe(
    'type',
    'scaffold type, `route` (handler+validation) / `crud` scaffold CRUD files'
  )
  .example('$0 new folder-name')
  .example('$0 add route')
  .help()
  .demandCommand(1).argv

debug('argv parse', argv)

// return pretty error without stacktrace for pre-defined errors
function cleanError (msg) {
  console.error('Error: ' + msg)
  return process.exit(1)
}

async function main () {
  function onCancel (prompt, response) {
    console.log('Exiting...')
    process.exit(0)
  }
  if (argv.dir && argv._[0] == 'new') {
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
    let filesToCompile = ['package.json', 'app.js', 'README.md']
    for (let i = 0; i < filesToCompile.length; i++) {
      let f = filesToCompile[i]
      let p = `${pathDir}/${f}`
      let r = await ejs.renderFile(p, setup)
      fs.writeFileSync(p, r)
    }
    console.log('> Done!\nNow run:')
    console.log(`cd ${pathDir} && npm install`)
  } else if (argv._[0] == 'add') {
    debug('add command')
    // TODO: look for generic config[, .json5, .js]
    let configFilePath = path.resolve('./config.json')
    let configFileExists = fs.existsSync(configFilePath)
    // TODO: allow user to choose config file if not found
    if (configFileExists == false) {
      return cleanError(`Config file not found in ${configFilePath}`)
    }
    if (argv.type == 'route') {
      debug('route type')

      let setup = await prompts(
        [
          {
            type: 'text',
            name: 'routeName',
            message: 'Route name',
            initial: 'todo',
            validate: value =>
              value.match(/[^\w]+/g) === null
                ? true
                : 'Only alphanumeric allowed'
          },
          {
            type: 'text',
            name: 'routePath',
            message: 'Route path',
            initial: prev => '/' + prev,
            validate: value =>
              value.startsWith('/') === true && value.match(/[^\w/]+/g) === null
                ? true
                : 'Route path must starts with / and contain only alphanumeric characters (e.g. /todo)'
          },
          {
            type: 'select',
            name: 'httpMethod',
            message: 'Choose HTTP method',
            choices: [
              { value: 'GET' },
              { value: 'POST' },
              { value: 'PUT' },
              { value: 'DELETE' },
              { value: 'PATCH' },
              { value: 'HEAD' },
              { value: 'CONNECT' },
              { value: 'OPTIONS' },
              { value: 'TRACE' }
            ],
            initial: 0
          },
          {
            type: 'toggle',
            name: 'generateHandler',
            message: 'Generate handler for this route?',
            initial: true,
            active: 'yes',
            inactive: 'no'
          },
          {
            type: 'toggle',
            name: 'generateValidation',
            message: 'Generate Joi validation for this route?',
            initial: true,
            active: 'yes',
            inactive: 'no'
          },
          {
            type: prev => (prev == true ? 'toggle' : null),
            name: 'provideJsonJoi',
            message:
              'Do you have a JSON that describes a valid input? (we will generate a Joi validation from this)',
            initial: false,
            active: 'yes',
            inactive: 'no'
          },
          {
            type: prev => (prev == true ? 'text' : null),
            name: 'validationStarter',
            message:
              'Enter a JSON describing a valid input - Press enter to skip',
            validate: value => {
              if (value === '') return true
              try {
                JSON.parse(value)
                return true
              } catch (e) {
                return 'Provide a valid JSON or skip this step by deleting and pressing enter'
              }
            }
          }
        ],
        { onCancel }
      )
      setup.configFilePath = configFilePath
      if (setup.provideJsonJoi == true && setup.validationStarter !== '') {
        let jsonObj = JSON.parse(setup.validationStarter)
        let generator = joiMachine.obj()
        generator.pipe(
          concat({ encoding: 'string' }, continueAdd.bind(this, setup))
        )
        generator.write(jsonObj)
        generator.end()
      } else {
        continueAdd(setup)
      }
    } else if (argv.type == 'crud') {
      debug('crud type')
      let setup = await prompts(
        [
          {
            type: 'text',
            name: 'name',
            message: 'CRUD resource name',
            initial: 'todo',
            validate: value =>
              value.match(/[^\w]+/g) === null
                ? true
                : 'Only alphanumeric allowed'
          },
          {
            type: 'toggle',
            name: 'provideJsonJoi',
            message:
              'Do you have a JSON that describes a valid resource input (for insert/definition)? (we will generate a Joi validation from this)',
            initial: false,
            active: 'yes',
            inactive: 'no'
          },
          {
            type: prev => (prev == true ? 'text' : null),
            name: 'validationStarter',
            message:
              'Enter a JSON describing a valid input - Press enter to skip',
            validate: value => {
              if (value === '') return true
              try {
                JSON.parse(value)
                return true
              } catch (e) {
                return 'Provide a valid JSON or skip this step by deleting and pressing enter'
              }
            }
          }
        ],
        { onCancel }
      )
      setup.configFilePath = configFilePath
      if (setup.provideJsonJoi == true && setup.validationStarter !== '') {
        let jsonObj = JSON.parse(setup.validationStarter)
        let generator = joiMachine.obj()
        generator.pipe(
          concat({ encoding: 'string' }, continueCrudAdd.bind(this, setup))
        )
        generator.write(jsonObj)
        generator.end()
      } else {
        continueCrudAdd(setup)
      }
    }
  } else {
    yargs.showHelp()
    return
  }
}

function getJoiDefinition (data, httpMethod) {
  let joiDefinition = JOI_BLANK_TEMPLATE
  if (data) {
    joiDefinition = data
      .substring(0, data.length - 2)
      .replace('Joi.object().keys({', '')
  }
  if (httpMethod && ['POST', 'PUT'].indexOf(httpMethod) > -1) {
    joiDefinition = '{body:{' + joiDefinition + '}}'
  } else joiDefinition = '{query:{' + joiDefinition + '}}'

  return joiDefinition
}

async function continueAdd (setup, data) {
  let joiDefinition = getJoiDefinition(data, setup.httpMethod)
  await compileAndSave(
    './templates/route/manager.js',
    setup.routeName + '.js',
    Object.assign(setup, { joiDefinition })
  )

  // update config
  let currentConfig = getConfig(setup.configFilePath)
  currentConfig.routes.push({
    path: setup.routePath,
    method: setup.httpMethod,
    manager: './' + setup.routeName + '.js'
  })
  saveConfig(setup.configFilePath, currentConfig)

  console.log(
    `Done, config file updated and route and validation generated as manager (one file):\n${dest}`
  )
}

async function compileAndSave (from, to, setup) {
  debug('compile and save', from, to, setup)
  let fromPath = path.join(__dirname, from)
  debug('fromPath', fromPath)
  let compiledFile = await ejs.renderFile(fromPath, setup)
  debug('ejs compile output', compiledFile)
  let destPath = path.join('./', to)

  // lint only javascript
  if (to.endsWith('.js')) {
    // TODO: add a try-catch and handle fail
    // lint js
    let lintFile = standard.lintTextSync(compiledFile, { fix: true })
    debug('lint file output', lintFile)
    let lintedJs = lintFile.results[0].output
    compiledFile = lintedJs
  }

  // ensure directories exist
  fs.ensureFileSync(destPath)

  // save file
  fs.writeFileSync(destPath, compiledFile)
}

function saveConfig (path, updatedConfig) {
  fs.writeFileSync(path, JSON.stringify(updatedConfig, null, 4))
  return true
}

function getConfig (path) {
  let currentConfig = JSON.parse(fs.readFileSync(path).toString())
  return currentConfig
}

async function continueCrudAdd (setup, data) {
  setup.joiDefinition = data
    ? data
    : '/* Joi.object().keys({name: Joi.string()}) */'

  // handler file
  const handlerPath = 'handler/' + setup.name + '.js'
  await compileAndSave('./templates/crud/handler/index.js', handlerPath, setup)
  // validation file
  const schemaPath = 'schema/' + setup.name + '.js'
  await compileAndSave('./templates/crud/schema/index.js', schemaPath, setup)

  // update config
  // TODO: handle fail
  let currentConfig = getConfig(setup.configFilePath)
  const crudSpec = {
    basePah: `/${setup.name}`,
    routesToCreate: [
      {
        extension: 'insertOne',
        method: 'POST'
      },
      {
        extension: 'findOne',
        method: 'GET',
        appendPath: '/:id'
      },
      {
        extension: 'findAll',
        method: 'GET'
      },
      {
        extension: 'updateOne',
        method: 'PUT',
        appendPath: '/:id'
      },
      {
        extension: 'deleteOne',
        method: 'DELETE',
        appendPath: '/:id'
      }
    ]
  }
  crudSpec.routesToCreate.forEach(r => {
    currentConfig.routes.push({
      path: crudSpec.basePah + (r.appendPath ? r.appendPath : ''),
      method: r.method,
      handler: `./${handlerPath.replace('.js', '')}.${r.extension}`,
      validation: `./${schemaPath.replace('.js', '')}.${r.extension}`
    })
  })
  // TODO: handle fail
  saveConfig(setup.configFilePath, currentConfig)

  console.log(
    `Done, config file updated and files generated\n${schemaPath}\n${handlerPath}`
  )
}

main()
