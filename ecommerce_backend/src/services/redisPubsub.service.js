'use strict'

const Redis = require('redis');

class RedisPubSubService {
  constructor() {
    this.subscriber = Redis.createClient()
    this.publisher = Redis.createClient()

    this.publisher.connect().then(() => {
      console.log('Publisher connected to Redis');
    }).catch(err =>  {
      console.log('Publisher connection error: ', err);
    })

    this.subscriber.connect().then(() => {
      console.log('Subscribe connected to Redis');
    }).catch(err => {
      console.log(('Subscriber connection error: ', err));
    })
  }

  async publish( channel, message ) {
    try {
      const reply = await this.publisher.publish(channel, message)
      return reply
    } catch (err) {
      console.error('Error publishing message: ', err);
      throw err
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel, (message) => {
        callback(channel, message)
      })
    } catch (err) {
      console.error('Error subscribing to channel: ', err)
      throw err;
    }
  }
}

module.exports = new RedisPubSubService()