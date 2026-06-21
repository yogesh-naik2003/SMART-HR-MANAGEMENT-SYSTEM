const pool = require("../config/db");
const { sendTrackedEmail } = require("../services/mailer");
const { invalidateDashboardSummary } = require("../services/cacheService");
const interviewTemplate = require("../templates/interviewInvitation");
const { success, error } = require("../utils/apiResponse");

async function notifyUser(userId, title, message) {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message)
     VALUES ($1, $2, $3)`,
    [userId, title, message]
  );
}

async function sendInterviewEmail(candidateId, date, time, meetingLink) {
  const candidateResult = await pool.query(
    "SELECT full_name, email FROM candidates WHERE id = $1",
    [candidateId]
  );

  if (candidateResult.rows.length === 0) {
    return;
  }

  const candidate = candidateResult.rows[0];
  await sendTrackedEmail({
    userId: null,
    type: "INTERVIEW_INVITATION_EMAIL",
    recipient: candidate.email,
    subject: "Interview Invitation",
    html: interviewTemplate({
      candidateName: candidate.full_name,
      date,
      time,
      meetingLink
    }),
    entityType: "INTERVIEW",
    entityId: null
  });
}

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      department_id,
      description,
      required_skills,
      experience_required,
      salary_range
    } = req.body || {};

    if (!title || !department_id) {
      return error(res, "title and department_id are required", 400);
    }

    const result = await pool.query(
      `INSERT INTO job_posts
       (
         title,
         department_id,
         description,
         required_skills,
         experience_required,
         salary_range,
         created_by
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        title,
        department_id,
        description || null,
        required_skills || null,
        experience_required || null,
        salary_range || null,
        req.user.userId
      ]
    );

    await notifyUser(
      req.user.userId,
      "Job Posted",
      `${title} has been posted successfully`
    );

    await invalidateDashboardSummary();

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { full_name, email, phone, experience } = req.body || {};

    if (!full_name || !email) {
      return error(res, "full_name and email are required", 400);
    }

    const existingCandidate = await pool.query(
      "SELECT id FROM candidates WHERE email = $1",
      [email]
    );

    if (existingCandidate.rows.length > 0) {
      return error(res, "Candidate already exists", 409);
    }

    const result = await pool.query(
      `INSERT INTO candidates
       (
         full_name,
         email,
         phone,
         experience
       )
       VALUES
       ($1,$2,$3,$4)
       RETURNING *`,
      [full_name, email, phone || null, experience || null]
    );

    await notifyUser(
      req.user.userId,
      "Candidate Created",
      `${full_name} has been added as a candidate`
    );

    await invalidateDashboardSummary();

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.applyJob = async (req, res) => {
  try {
    const { candidate_id, job_post_id } = req.body || {};

    if (!candidate_id || !job_post_id) {
      return error(res, "candidate_id and job_post_id are required", 400);
    }

    const existingApplication = await pool.query(
      `SELECT id
       FROM applications
       WHERE candidate_id = $1
         AND job_post_id = $2`,
      [candidate_id, job_post_id]
    );

    if (existingApplication.rows.length > 0) {
      return error(res, "Candidate already applied for this job", 409);
    }

    const result = await pool.query(
      `INSERT INTO applications
       (
         candidate_id,
         job_post_id
       )
       VALUES
       ($1,$2)
       RETURNING *`,
      [candidate_id, job_post_id]
    );

    await notifyUser(
      req.user.userId,
      "Application Submitted",
      `A new application has been submitted for job ${job_post_id}`
    );

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.scheduleInterview = async (req, res) => {
  try {
    const { candidate_id, job_post_id, interview_date, interview_time, meeting_link } = req.body || {};

    if (!candidate_id || !job_post_id || !interview_date || !interview_time || !meeting_link) {
      return error(res, "candidate_id, job_post_id, interview_date, interview_time and meeting_link are required", 400);
    }

    const result = await pool.query(
      `INSERT INTO interviews
       (
         candidate_id,
         job_post_id,
         interview_date,
         interview_time,
         meeting_link,
         scheduled_by
       )
       VALUES
       ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [candidate_id, job_post_id, interview_date, interview_time, meeting_link, req.user.userId]
    );

    await sendInterviewEmail(candidate_id, interview_date, interview_time, meeting_link);

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      department_id,
      description,
      required_skills,
      experience_required,
      salary_range
    } = req.body || {};

    const existing = await pool.query("SELECT id FROM job_posts WHERE id = $1", [jobId]);
    if (existing.rows.length === 0) {
      return error(res, "Job not found", 404);
    }

    const result = await pool.query(
      `UPDATE job_posts
       SET title = COALESCE($1, title),
           department_id = COALESCE($2, department_id),
           description = COALESCE($3, description),
           required_skills = COALESCE($4, required_skills),
           experience_required = COALESCE($5, experience_required),
           salary_range = COALESCE($6, salary_range)
       WHERE id = $7
       RETURNING *`,
      [title, department_id, description, required_skills, experience_required, salary_range, jobId]
    );

    await invalidateDashboardSummary();
    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const existing = await pool.query("SELECT id FROM job_posts WHERE id = $1", [jobId]);
    if (existing.rows.length === 0) {
      return error(res, "Job not found", 404);
    }

    const result = await pool.query(
      "DELETE FROM job_posts WHERE id = $1 RETURNING *",
      [jobId]
    );

    await invalidateDashboardSummary();
    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { full_name, email, phone, experience } = req.body || {};

    const existing = await pool.query("SELECT id FROM candidates WHERE id = $1", [candidateId]);
    if (existing.rows.length === 0) {
      return error(res, "Candidate not found", 404);
    }

    const result = await pool.query(
      `UPDATE candidates
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           experience = COALESCE($4, experience)
       WHERE id = $5
       RETURNING *`,
      [full_name, email, phone, experience, candidateId]
    );

    await invalidateDashboardSummary();
    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const existing = await pool.query("SELECT id FROM candidates WHERE id = $1", [candidateId]);
    if (existing.rows.length === 0) {
      return error(res, "Candidate not found", 404);
    }

    const result = await pool.query(
      "DELETE FROM candidates WHERE id = $1 RETURNING *",
      [candidateId]
    );

    await invalidateDashboardSummary();
    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getJobs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT j.*, d.department_name
      FROM job_posts j
      LEFT JOIN departments d ON j.department_id = d.id
      ORDER BY j.created_at DESC
    `);
    return success(res, result.rows);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, a.application_status as status, j.title as applied_job
      FROM candidates c
      LEFT JOIN applications a ON c.id = a.candidate_id
      LEFT JOIN job_posts j ON a.job_post_id = j.id
      ORDER BY c.created_at DESC
    `);
    return success(res, result.rows);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getFunnel = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT application_status as name, COUNT(id) as value
      FROM applications
      GROUP BY application_status
    `);
    
    // Add default zero values for any missing stages to ensure the chart renders properly
    const stages = ["APPLIED", "SHORTLISTED", "INTERVIEWED", "SELECTED", "REJECTED"];
    const funnelMap = result.rows.reduce((acc, row) => {
      acc[row.name] = parseInt(row.value, 10);
      return acc;
    }, {});
    
    const formattedFunnel = stages.map(stage => ({
      name: stage,
      value: funnelMap[stage] || 0
    }));

    return success(res, formattedFunnel);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
