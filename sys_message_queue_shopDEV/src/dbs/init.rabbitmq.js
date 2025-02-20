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

module.exports = {
  connectToRabbitMQ, 
  connectToRabbitMQForTest
}