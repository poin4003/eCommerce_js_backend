const { Kafka, logLevel } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.NOTHING
})

const runProducer = async () => {
  const producer = kafka.producer()

  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello KafkaJS user By Pchuy!' },
    ],
  })

  await producer.disconnect()
}

runProducer().catch(console.error)