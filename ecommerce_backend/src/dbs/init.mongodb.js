'use strict'

const mongoose = require('mongoose')
const { db: { host, name, port } } = require('../configs/config')

const { countConnect } = require('../helpers/check.connect')

const connectionString = `mongodb://${host}:${port}/${name}`

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }
    mongoose.connect(connectionString, {
      maxPoolSize: 50
    }).then( _ => {
      console.log(`Connected mongodb success`, countConnect());
    }).catch(err => console.log(`Error Connect!`))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }
}

const instaceMongodb = Database.getInstance()

module.exports = instaceMongodb