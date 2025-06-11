"use strict";

const { getIORedis } = require("../../dbs/init.ioredis");

const setCacheIO = async ({ key, value }) => {
  const redisCache = getIORedis();
  if (!redisCache) throw new Error("Redis client not initialized");
  return await redisCache.set(key, value);
};

const setCacheIOExpiration = async ({ key, value, expirationInSeconds }) => {
  const redisCache = getIORedis();
  if (!redisCache) throw new Error("Redis client not initialized");
  return await redisCache.set(key, value, "EX", expirationInSeconds);
};

const getCacheIO = async ({ key }) => {
  const redisCache = getIORedis();
  if (!redisCache) throw new Error("Redis client not initialized");
  return await redisCache.get(key);
};


module.exports = {
  setCacheIO,
  setCacheIOExpiration,
  getCacheIO,
};
