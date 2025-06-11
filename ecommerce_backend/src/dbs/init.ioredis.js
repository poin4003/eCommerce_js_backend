"use strict";

const Redis = require("ioredis");
const { RedisErrorResponse } = require("../core/error.response");

let clients = {},
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
    console.log(`connectionIoRedis - Connection status: connected`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionIoRedis - Connection status: disconnected`);
    // connect retry
    handleTimeoutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionIoRedis - Connection status: reconnecting`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(`connectionIoRedis - Connection status: error ${err}`);
    // connect retry
    handleTimeoutError();
  });
};

const initIORedis = async ({
  IOREDIS_IS_ENABLED,
  IOREDIS_HOST = process.env.REDIS_CACHE_HOST,
  IOREDIS_PORT = 6379,
  IOREDIS_PASSWORD = process.env.REDIS_PASSWORD,
}) => {
  if (IOREDIS_IS_ENABLED) {
    const instanceRedis = new Redis({
      host: IOREDIS_HOST,
      port: IOREDIS_PORT,
      password: IOREDIS_PASSWORD,
    });

    clients.instanceRedis = instanceRedis;

    if (!clients.instanceRedis) { 
      throw new Error("Redis client not initialized");
    }

    handleEventConnection({ connectionRedis: instanceRedis }); 
  }
};

const getIORedis = () => {
  if (!clients.instanceRedis) {
    throw new Error("Redis client not initialized");
  }
  return clients.instanceRedis;
};


const closeIORedis = () => {
  if (clients.instanceRedis) {
    clients.instanceRedis.quit();
    clients.instanceRedis = null;
    console.log(`Redis connection closed`);
  }
};

module.exports = {
  initIORedis,
  getIORedis,
  closeIORedis,
};
