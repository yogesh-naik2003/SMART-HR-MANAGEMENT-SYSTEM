module.exports = ({ name, month, year, netSalary }) => `
<h2>Payroll Generated</h2>
<p>Hi ${name},</p>
<p>Your payroll for ${month}/${year} has been generated.</p>
<p>Net Salary: ${netSalary}</p>
`;
