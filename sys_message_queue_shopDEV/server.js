'use strict'

const { consumerToQueue, consumerQueueNormal, consumerQueueFailed } = require('./src/services/consumerQueue.service')
const queueName = 'test-topic'

// consumerToQueue(queueName).then(() => {
//   console.log(`Message consumer stared ${queueName}`)
// }).catch(err => {
//   console.error(`Message error: ${err.message}`);
// })

consumerQueueNormal(queueName).then(() => {
  console.log(`Message consumerQueueNormal stared`)
}).catch(err => {
  console.error(`Message error: ${err.message}`);
})

consumerQueueFailed(queueName).then(() => {
  console.log(`Message consumerQueueFailed stared`)
}).catch(err => {
  console.error(`Message error: ${err.message}`);
})

