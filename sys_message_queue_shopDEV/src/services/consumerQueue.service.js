'use strict'

const {
  consumerQueue,
  connectToRabbitMQ
} = require('../dbs/init.rabbitmq')

// const log = console.log

// console.log = function() {
//   log.apply(console, [new Date()].concat(arguments))
// }

const messageService = {
  consumerToQueue: async (queueName) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()
      await consumerQueue(channel, queueName)
    } catch (error) {
      console.error(`Error consumerToQueue::${error}`)
    }
  },
  // case processing 
  consumerQueueNormal: async (queueName) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()

      const notiQueue = 'notificationQueueProcess' // assertQueue 

      // 1. TTL

      // const timeExpired = 5000
      // setTimeout(() => {
      //   channel.consume(notiQueue, msg => {
      //     console.log(`SEND notificationQueueProcess successfully processed::${msg.content.toString()}`)
      //     channel.ack(msg) 
      //   })
      // }, timeExpired)

      // 2. Logic
      channel.consume(notiQueue, msg => {
        try {
          const numberTest = Math.random()
          console.log({ numberTest })

          if (numberTest < 0.8) {
            throw new Error('Send notification failed: HOT FIX')
          }

          console.log(`SEND notificationQueueProcess successfully processed::${msg.content.toString()}`)
          channel.ack(msg)
        } catch (error) {
          console.error(`SEND notification error:: ${error}`)
          channel.nack(msg, false, false)
        }
      })  
    } catch (error) {
      console.error(`error::${error}`)
    }
  },
  // case failed processing
  consumerQueueFailed: async (queueName) => {
    try {
      const { channel, connection } = await connectToRabbitMQ()

      const notificationExchangeDLX = 'notificationExDLX' // notificationExDLX direct
      const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX' // assert
      const notiQueueHandler = 'notificationQueueHotFix'

      await channel.assertExchange(notificationExchangeDLX, 'direct', {
        durable: true
      })

      const queueResult = await channel.assertQueue(notiQueueHandler, {
        exclusive: false
      })

      await channel.bindQueue( queueResult.queue, notificationExchangeDLX, notificationRoutingKeyDLX)
      await channel.consume( queueResult.queue, msgFailed => {
        console.log(`this notification error: please hot fix::${msgFailed.content.toString()}`)
      }, {
        noAck: true
      })
    } catch (error) {
      console.error(`error::${error}`)
    }
  }
}

module.exports = messageService