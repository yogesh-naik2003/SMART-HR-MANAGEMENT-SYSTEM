const { Queue } = require("bullmq");
const IORedis = require("ioredis");

let queue = null;
let redisConnection = null;

function getRedisConnection() {
  if (!process.env.REDIS_HOST) {
    return null;
  }

  return new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
  });
}

function getEmailQueue() {
  if (queue) {
    return queue;
  }

  redisConnection = getRedisConnection();
  if (!redisConnection) {
    return null;
  }

  queue = new Queue("emails", {
    connection: redisConnection
  });

  return queue;
}

async function enqueueEmail(jobData) {
  const emailQueue = getEmailQueue();
  if (!emailQueue) {
    return false;
  }

  await emailQueue.add("send-email", jobData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  });

  return true;
}

function hasQueue() {
  return Boolean(getEmailQueue());
}

module.exports = {
  enqueueEmail,
  hasQueue
};
