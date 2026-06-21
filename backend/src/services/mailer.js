const sendEmail = require("./emailService");
const { enqueueEmail, hasQueue } = require("./emailQueue");
const {
  createEmailLog,
  updateEmailLogStatus
} = require("./emailLogService");

async function sendTrackedEmail({
  userId = null,
  type,
  recipient,
  subject,
  html,
  entityType = null,
  entityId = null
}) {
  const emailLogId = await createLog({
    userId,
    type,
    subject,
    recipient,
    entityType,
    entityId
  });

  const jobData = {
    emailLogId,
    to: recipient,
    subject,
    html
  };

  if (hasQueue()) {
    await enqueueEmail(jobData);
    await updateEmailLogStatus(emailLogId, "PENDING");
    return { queued: true, emailLogId };
  }

  try {
    await sendEmail(recipient, subject, html);
    await updateEmailLogStatus(emailLogId, "SENT");
    return { queued: false, emailLogId };
  } catch (error) {
    await updateEmailLogStatus(emailLogId, "FAILED", error.message);
    throw error;
  }
}

async function createLog({
  userId,
  type,
  subject,
  recipient,
  entityType,
  entityId
}) {
  const result = await createEmailLog({
    userId,
    type,
    subject,
    recipient,
    status: "QUEUED",
    entityType,
    entityId
  });

  return result?.rows?.[0]?.id || null;
}

module.exports = {
  sendTrackedEmail
};
