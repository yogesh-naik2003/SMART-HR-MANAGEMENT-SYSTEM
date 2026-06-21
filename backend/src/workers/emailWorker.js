const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const sendEmail = require("../services/emailService");
const {
  updateEmailLogStatus
} = require("../services/emailLogService");

if (process.env.REDIS_HOST) {
  const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
  });

  new Worker(
    "emails",
    async (job) => {
      const {
        emailLogId,
        to,
        subject,
        html
      } = job.data;

      try {
        await sendEmail(to, subject, html);
        if (emailLogId) {
          await updateEmailLogStatus(emailLogId, "SENT");
        }
      } catch (error) {
        if (emailLogId) {
          await updateEmailLogStatus(emailLogId, "FAILED", error.message);
        }
        throw error;
      }
    },
    {
      connection
    }
  );
}

module.exports = null;
