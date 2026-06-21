const { sendTrackedEmail } = require("../services/mailer");
const { success, error } = require("../utils/apiResponse");

exports.sendTestEmail = async (req, res) => {
 try {
  const { email } = req.body;

  await sendTrackedEmail({
   type: "TEST_EMAIL",
   recipient: email,
   subject: "HRMS Test Email",
   html: `
   <h1>Welcome to HRMS</h1>
   <p>Email service working.</p>
   `
  });

  return success(res, {
   message: "Email sent successfully"
  });
 } catch (err) {
  return error(res, err.message, 500);
 }
};
