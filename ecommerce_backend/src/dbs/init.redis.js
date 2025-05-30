"use strict";

const redis = require("redis");
const { RedisErrorResponse } = require("../core/error.response");

let client = {},
  statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
  },
  connectionTimeout;

const REDIS_CONNECT_TIMEOUT = 10000,
  REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
      vn: "Redis lỗi rồi",
      en: "Services connect error",
    },
  };

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = ({ connectionRedis }) => {
  // Check if connection is null
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log(`connectionRedis - Connection status: connected`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionRedis - Connection status: disconnected`);
    // connect retry
    handleTimeoutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionRedis - Connection status: reconnecting`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(`connectionRedis - Connection status: error ${err}`);
    // connect retry
    handleTimeoutError();
  });
};

const initRedis = () => {
  const instanceRedis = redis.createClient({
    host: "localhost",
    port: 6379,
    password: "",
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Max retries reaced");
      }
      return Math.min(retries * 1000, 3000);
    }
  });

  client.instanceRedis = instanceRedis;

  handleEventConnection({
    connectionRedis: instanceRedis,
  });
};

const getRedis = () => {
  return client.instanceRedis;
};

const closeRedis = () => {
  if (client.instanceRedis) {
    client.instanceRedis.quit();
    client.instanceRedis = null;
    console.log(`Redis connection closed`);
  }
};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
