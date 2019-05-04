# m10-cli

[![npm version](https://badge.fury.io/js/m10-cli.svg)](https://badge.fury.io/js/m10-cli)

Scaffold tool for [m10](https://github.com/V3RITAS-UTD/m10)-based projects

**Work in progress**

# Install

`npm i -g m10-cli`

# Options

 * [Create a new boilerplate project](#create-a-new-boilerplate-project)
 * [Generate CRUD resources for existing project](#generate-crud-resources-for-existing-project)
 * [Add route/validation to existing project](#add-route-validation-to-existing-project)


# Create a new boilerplate project

`m10-cli new folder-name-here`

Will create a new boilerplate with the following folders/files (you don't need to follow this pattern, you can use any files and folder in your configuration file):

 * `app.js`

   		Express and m10 setup

 * `config.json`

   		Blank configuration

 * `schema/`

   		Empty folder for validation files

 * `handler/`

   		Empty folder for handler files

 * `middleware/`

   		Empty folder for middleware files


# Generate CRUD resources for existing project

In the root of your m10 project run:

`m10-cli add crud`

Follow the prompts and will generate a complete CRUD handlers/validations automatically with MongoDB support.


# Add route/validation to existing project

In the root of your m10 project run:

`m10-cli add route`

Follow the prompts and will generate a new route and validation based on your inputs.

