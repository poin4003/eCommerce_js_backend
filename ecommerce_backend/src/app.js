const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')

// Init config
require('dotenv').config()

// Init db
require('./dbs/init.mongodb')

// Check overload
// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()

// test pub sub redis
require('./tests/inventory.test')
const productTest =  require('./tests/product.test')

productTest.purchaseProduct('product:001', 10)

const app = express()

// Init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

// Init Router
app.use('/', require('./routes'))



// Handle rrrors
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(err)
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error.message || 'internal server error'
  })
})



module.exports = app