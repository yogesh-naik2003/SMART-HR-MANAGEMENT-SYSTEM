module.exports = ({ candidateName, date, time, meetingLink }) => `
<h2>Interview Invitation</h2>
<p>Hi ${candidateName},</p>
<p>Your interview is scheduled for ${date} at ${time}.</p>
<p>Meeting Link: <a href="${meetingLink}">${meetingLink}</a></p>
`;
