'use strict'

const amqp = require('amqplib')

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost')
    if (!connection) throw new Error('Connect to rabbitmq failed!')

    const channel = await connection.createChannel()

    return { channel, connection }
  } catch (error) {

  }
}

const connectToRabbitMQForTest = async () => {
  try {
    const { channel, connection } = await connectToRabbitMQ()

    // Publish message to a queue
    const queue = 'test-queue'
    const message = 'Hello shopDEV by pchuy'

    await channel.assertQueue(queue)
    await channel.sendToQueue(queue, Buffer.from(message))

    // close the connection
    await connection.close()
  } catch (error) {
    console.error(`Connect to rabbitmq failed: ${err}`)
  }
}

const consumerQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, { durable: true })
    console.log(`Wating for message...`)
    channel.consume( queueName, msg => {
      console.log(`Receive message: ${queueName}:::${msg.content.toString()}`)
      // 1. find user following 
      // 2. send message to user
      // 3. yes, ok => success
      // 4. error, setup DLX ....
    }, {
      noAck: true
    })
  } catch (error) {
    console.error('error publish message to rabbitMQ::', error)
  }
}

module.exports = {
  connectToRabbitMQ, 
  connectToRabbitMQForTest,
  consumerQueue
}