'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECONDS = 5000

// Count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length
  console.log(`Number of connection::${numConnection}`)
}


// Check over load 
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connection.length 
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    // Example maximum number of connections based of cores
    const maxConnections = numCores * 5

    console.log(`Active connections:: ${numConnection}`)
    console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`)

    if (numConnection > maxConnections) {
      console.log(`Connection overload detected!`)
    }

  }, _SECONDS) // Motinor every _SECONDS
}

module.exports = {
  countConnect,
  checkOverload
}