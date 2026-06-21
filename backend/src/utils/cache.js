const redisClient = require("../config/redis");

async function getCache(key) {
 try {
  return await redisClient.get(key);
 } catch (err) {
  return null;
 }
}

async function setCache(key, value, ttlSeconds = 30) {
 try {
  return await redisClient.set(key, value, { EX: ttlSeconds });
 } catch (err) {
  return null;
 }
}

async function deleteCache(key) {
 try {
  return await redisClient.del(key);
 } catch (err) {
  return 0;
 }
}

module.exports = {
 getCache,
 setCache,
 deleteCache
};
