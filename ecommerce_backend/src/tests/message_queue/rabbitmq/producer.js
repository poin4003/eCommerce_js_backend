const amqp = require('amqplib')

const messages = 'new a product: Title: abcs'

const runProducer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost')
    const channel = await connection.createChannel()

    const queueName = 'test-topic'
    await channel.assertQueue(queueName, {
      durable: true
    })

    // send messages to consumer channel
    channel.sendToQueue( queueName, Buffer.from(messages) )
    
    setTimeout(() => {
      connection.close()
      process.exit(0)
    }, 500)
  } catch (error) {
    console.error(error)
  }
}

runProducer().then(rs => console.log(rs)).catch(console.error)