const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

let redisClient = null;

if (process.env.REDIS_URL || process.env.REDIS_HOST) {
 redisClient = createClient({ url: redisUrl });

 redisClient.on("error", (err) => {
  console.log("Redis Error", err.message || err);
 });

 redisClient.connect().catch((err) => {
  console.log("Redis Connect Failed", err.message || err);
 });
}

const fallbackRedis = {
 async get() {
  return null;
 },
 async set() {
  return null;
 },
 async del() {
  return 0;
 }
};

module.exports = redisClient || fallbackRedis;
