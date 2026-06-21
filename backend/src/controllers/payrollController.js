const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const createAuditLog = require("../services/auditService");
const { sendTrackedEmail } = require("../services/mailer");
const payrollGeneratedTemplate = require("../templates/payrollGenerated");
const { success, error } = require("../utils/apiResponse");

async function notifyEmployee(employeeId, title, message) {
  const employeeResult = await pool.query(
    "SELECT user_id FROM employees WHERE id = $1",
    [employeeId]
  );

  if (employeeResult.rows.length === 0 || !employeeResult.rows[0].user_id) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications (user_id, title, message)
     VALUES ($1, $2, $3)`,
    [employeeResult.rows[0].user_id, title, message]
  );
}

exports.generatePayroll = async (req, res) => {
  try {
    const { employee_id, month, year, bonus = 0 } = req.body || {};

    if (!employee_id || !month || !year) {
      return error(res, "employee_id, month and year are required", 400);
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);
    if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12 || Number.isNaN(yearNumber)) {
      return error(res, "month must be 1-12 and year must be valid", 400);
    }

    const employeeResult = await pool.query(
      `SELECT id, employee_code, name, salary
       FROM employees
       WHERE id = $1`,
      [employee_id]
    );

    if (employeeResult.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const employee = employeeResult.rows[0];
    const startDate = new Date(yearNumber, monthNumber - 1, 1);
    const endDate = new Date(yearNumber, monthNumber, 0);
    const totalDaysInMonth = endDate.getDate();

    const attendanceResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE check_in IS NOT NULL) AS present_days,
         COUNT(*) FILTER (WHERE check_in::time > TIME '09:15:00') AS late_days
       FROM attendance
       WHERE employee_id = $1
         AND attendance_date >= $2
         AND attendance_date <= $3`,
      [employee_id, startDate, endDate]
    );

    const leaveResult = await pool.query(
      `SELECT COALESCE(SUM(end_date - start_date + 1), 0) AS unpaid_leave_days
       FROM leave_requests
       WHERE employee_id = $1
         AND status = 'APPROVED'
         AND leave_type_id = 2
         AND start_date <= $3
         AND end_date >= $2`,
      [employee_id, startDate, endDate]
    );

    const grossSalary = Number(employee.salary);
    const perDaySalary = grossSalary / totalDaysInMonth;
    const presentDays = Number(attendanceResult.rows[0].present_days || 0);
    const lateDays = Number(attendanceResult.rows[0].late_days || 0);
    const unpaidLeaveDays = Number(leaveResult.rows[0].unpaid_leave_days || 0);
    const absentDays = Math.max(totalDaysInMonth - presentDays - unpaidLeaveDays, 0);

    const unpaidLeaveDeduction = unpaidLeaveDays * perDaySalary;
    const absentDeduction = absentDays * perDaySalary;
    const lateDeduction = lateDays * (perDaySalary * 0.1);
    const totalDeductions = unpaidLeaveDeduction + absentDeduction + lateDeduction;
    const salaryAfterAttendance = grossSalary - unpaidLeaveDeduction - absentDeduction - lateDeduction;
    const annualSalary = grossSalary * 12;
    const monthlyTax = calculateTax(annualSalary) / 12;
    const bonusAmount = Number(bonus || 0);
    const netSalary = Math.max(salaryAfterAttendance - monthlyTax + bonusAmount, 0);

    const result = await pool.query(
      `INSERT INTO payroll
       (
         employee_id,
         month,
         year,
         basic_salary,
         deductions,
         bonus,
         net_salary
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        employee_id,
        monthNumber,
        yearNumber,
        grossSalary,
        totalDeductions,
        bonusAmount,
        netSalary
      ]
    );

    const payslip = {
      employee: {
        id: employee.id,
        name: employee.name,
        employee_code: employee.employee_code,
        salary: grossSalary
      },
      period: { month: monthNumber, year: yearNumber },
      attendance: {
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
        unpaid_leave_days: unpaidLeaveDays
      },
      salary_breakdown: {
        gross_salary: grossSalary,
        unpaid_leave_deduction: unpaidLeaveDeduction,
        absent_deduction: absentDeduction,
        late_deduction: lateDeduction,
        tax: monthlyTax,
        bonus: bonusAmount,
        net_salary: netSalary
      }
    };

    const pdfBuffer = buildSimplePdf(payslip);
    const payslipDir = path.join(__dirname, "..", "..", "payslips");
    if (!fs.existsSync(payslipDir)) {
      fs.mkdirSync(payslipDir, { recursive: true });
    }
    const pdfFileName = `payslip_${employee_id}_${yearNumber}_${String(monthNumber).padStart(2, "0")}.pdf`;
    const pdfPath = path.join(payslipDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);

    await notifyEmployee(
      employee_id,
      "Payroll Generated",
      `Your payroll for ${monthNumber}/${yearNumber} has been generated`
    );

    const employeeEmailResult = await pool.query(
      `SELECT u.email, u.name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = $1`,
      [employee_id]
    );

    if (employeeEmailResult.rows.length > 0) {
      const employeeEmail = employeeEmailResult.rows[0];
      await sendTrackedEmail({
        userId: employee_id,
        type: "PAYROLL_GENERATED_EMAIL",
        recipient: employeeEmail.email,
        subject: "Payroll Generated",
        html: payrollGeneratedTemplate({
          name: employeeEmail.name,
          month: monthNumber,
          year: yearNumber,
          netSalary
        }),
        entityType: "PAYROLL",
        entityId: result.rows[0].id
      });
    }

    await createAuditLog(
      req.user.userId,
      "GENERATE_PAYROLL",
      "PAYROLL",
      result.rows[0].id,
      `Payroll generated for employee ${employee_id}`
    );

    return success(res, {
      payroll: result.rows[0],
      payslip_path: pdfPath,
      summary: payslip
    }, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getPayrolls = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, e.employee_code
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id`
    );

    return success(res, result.rows);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

function calculateTax(annualIncome) {
  const slabs = [
    { limit: 500000, rate: 0 },
    { limit: 1000000, rate: 0.05 },
    { limit: Infinity, rate: 0.2 }
  ];

  let remaining = annualIncome;
  let previousLimit = 0;
  let tax = 0;

  for (const slab of slabs) {
    const cap = slab.limit === Infinity ? remaining : slab.limit - previousLimit;
    const taxable = Math.min(remaining, cap);
    if (taxable > 0) {
      tax += taxable * slab.rate;
      remaining -= taxable;
    }
    previousLimit = slab.limit;
    if (remaining <= 0) break;
  }

  return tax;
}

function buildSimplePdf(payslip) {
  const lines = [
    "Payslip",
    `Employee: ${payslip.employee.name} (${payslip.employee.employee_code})`,
    `Period: ${payslip.period.month}/${payslip.period.year}`,
    `Gross Salary: ${payslip.salary_breakdown.gross_salary}`,
    `Unpaid Leave Deduction: ${payslip.salary_breakdown.unpaid_leave_deduction}`,
    `Absent Deduction: ${payslip.salary_breakdown.absent_deduction}`,
    `Late Deduction: ${payslip.salary_breakdown.late_deduction}`,
    `Tax: ${payslip.salary_breakdown.tax}`,
    `Bonus: ${payslip.salary_breakdown.bonus}`,
    `Net Salary: ${payslip.salary_breakdown.net_salary}`
  ];

  const content = [
    "BT /F1 18 Tf 50 800 Td (Payslip) Tj ET",
    ...lines.map((line, index) => `BT /F1 12 Tf 50 ${770 - index * 20} Td (${escapePdfText(line)}) Tj ET`)
  ].join("\n");

  const objects = [];
  objects.push("%PDF-1.4");
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj");
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(`5 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream endobj`);

  let pdf = "";
  const offsets = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += obj + "\n";
  }
  const xrefPos = Buffer.byteLength(pdf);
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function escapePdfText(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

exports.downloadPayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM payroll WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Payroll not found");
    }
    const payroll = result.rows[0];
    const pdfFileName = `payslip_${payroll.employee_id}_${payroll.year}_${String(payroll.month).padStart(2, "0")}.pdf`;
    const pdfPath = path.join(__dirname, "..", "..", "payslips", pdfFileName);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).send("Payslip PDF not found");
    }
    
    res.download(pdfPath);
  } catch (err) {
    next(err);
  }
};
