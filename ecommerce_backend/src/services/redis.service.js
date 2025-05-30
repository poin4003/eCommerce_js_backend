"use strict";

const {
  revervationInventory,
} = require("../models/repositories/inventory.repo");
const { getRedis } = require("../dbs/init.redis");
const {
  instanceConnect: redisClient
} = getRedis()

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2025_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // 3 seconds

  for (let i = 0; i < retryTimes; i++) {
    // create key, check if user has key then allow user to checkout
    const result = await setNX(key, expireTime);
    console.log(`result:::`, result);

    if (result === 1) {
      // transaction with inventory
      const isReversation = await revervationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReversation.modifiedCount) {
        await redisClient.pExpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  return await redisClient.del(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
