require('dotenv').config()
const m10 = require('m10')
const express = require('express')
const bodyparser = require('body-parser')
const morgan = require('morgan')
<%_ if (mongodb) { _%>
const expressMongoDb = require('express-mongo-db')
<%_ } _%>
const helmet = require('helmet')
const app = express()
const port = process.env.PORT || 3000
// load config
const config = require('./config.json')
// load basic middlewares
app.use(helmet())
app.use(bodyparser.json())
app.use(morgan('tiny'))
<%_ if (mongodb) { _%>
// mongodb
app.use(expressMongoDb(process.env.MONGODB_URL || 'mongodb://localhost/test'));
<%_ } _%>
// load config into this app
m10.init(config, app)

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`> Listening on localhost:${port} on ${process.env.NODE_ENV} mode`))
}

module.exports = app
