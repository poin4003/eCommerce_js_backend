const amqp = require('amqplib')

// const log = console.log

// console.log = function() {
//   log.apply(console, [new Date()].concat(arguments))
// }

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost')
    const channel = await connection.createChannel()

    const notificationExchange = 'notificationEx' // notificationEx direct
    const notificationRoutingKey = 'notificationRoutingKey'
    const notiQueue = 'notificationQueueProcess' // assertQueue 
    const notificationExchangeDLX = 'notificationExDLX' // notificationExDLX direct
    const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX' // assert
    
    // 1. create exchanger
    await channel.assertExchange(notificationExchange, 'direct', {
      durable: true
    })

    // 2. create queue
    const queueResult = await channel.assertQueue( notiQueue, {
      exclusive: false, // allow other connection connect to queue
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX
    })

    // 3. bidingQueue
    await channel.bindQueue(queueResult.queue, notificationExchange, notificationRoutingKey)

    // 4. send message
    const msg = 'a new product'
    console.log(`producer msg::${msg}`)
    
    await channel.publish(notificationExchange, notificationRoutingKey, Buffer.from(msg), {
      expiration: '10000'
    })

    setTimeout(() => {
      connection.close()
      process.exit(0)
    }, 500)
  } catch (error) {
    console.error(error)
  }
}

runProducer().then(rs => console.log(rs)).catch(console.error)