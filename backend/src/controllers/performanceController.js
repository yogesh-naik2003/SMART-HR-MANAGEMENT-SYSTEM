const pool = require("../config/db");
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

exports.createGoal = async (req, res) => {
  try {
    const { title, description } = req.body || {};

    if (!title) {
      return error(res, "title is required", 400);
    }

    const result = await pool.query(
      `INSERT INTO goals
       (
         title,
         description
       )
       VALUES
       ($1,$2)
       RETURNING *`,
      [title, description || null]
    );

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.assignGoal = async (req, res) => {
  try {
    const { employee_id, goal_id, target_date = null } = req.body || {};

    if (!employee_id || !goal_id) {
      return error(res, "employee_id and goal_id are required", 400);
    }

    const employeeExists = await pool.query("SELECT id FROM employees WHERE id = $1", [employee_id]);
    if (employeeExists.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const goalExists = await pool.query("SELECT id FROM goals WHERE id = $1", [goal_id]);
    if (goalExists.rows.length === 0) {
      return error(res, "Goal not found", 404);
    }

    const existingAssignment = await pool.query(
      "SELECT id FROM employee_goals WHERE employee_id = $1 AND goal_id = $2",
      [employee_id, goal_id]
    );
    if (existingAssignment.rows.length > 0) {
      return error(res, "Goal already assigned to this employee", 409);
    }

    const result = await pool.query(
      `INSERT INTO employee_goals
       (
         employee_id,
         goal_id,
         progress,
         status,
         target_date
       )
       VALUES
       ($1,$2,$3,$4,$5)
       RETURNING *`,
      [employee_id, goal_id, 0, "NOT_STARTED", target_date]
    );

    await notifyEmployee(
      employee_id,
      "Goal Assigned",
      "A new performance goal has been assigned to you"
    );

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const goalId = req.params.id;
    const { progress, status = null } = req.body || {};

    if (progress === undefined || progress === null) {
      return error(res, "progress is required", 400);
    }

    const progressNumber = Number(progress);
    if (Number.isNaN(progressNumber) || progressNumber < 0 || progressNumber > 100) {
      return error(res, "progress must be between 0 and 100", 400);
    }

    const existingGoal = await pool.query("SELECT id FROM employee_goals WHERE id = $1", [goalId]);
    if (existingGoal.rows.length === 0) {
      return error(res, "Assigned goal not found", 404);
    }

    const result = await pool.query(
      `UPDATE employee_goals
       SET progress = $1,
           status = COALESCE($2, status)
       WHERE id = $3
       RETURNING *`,
      [progressNumber, status, goalId]
    );

    const assignmentResult = await pool.query(
      `SELECT eg.employee_id, g.title
       FROM employee_goals eg
       JOIN goals g ON eg.goal_id = g.id
       WHERE eg.id = $1`,
      [goalId]
    );

    if (assignmentResult.rows.length > 0) {
      await notifyEmployee(
        assignmentResult.rows[0].employee_id,
        "Goal Progress Updated",
        `Your goal "${assignmentResult.rows[0].title}" is now at ${progressNumber}%`
      );
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.addReview = async (req, res) => {
  try {
    const { employee_id, reviewer_id, review_period, rating, comments } = req.body || {};

    if (!employee_id || !review_period || rating === undefined || rating === null) {
      return error(res, "employee_id, review_period and rating are required", 400);
    }

    const employeeExists = await pool.query("SELECT id FROM employees WHERE id = $1", [employee_id]);
    if (employeeExists.rows.length === 0) {
      return error(res, "Employee not found", 404);
    }

    const reviewerExists = await pool.query("SELECT id FROM users WHERE id = $1", [reviewer_id]);
    if (reviewer_id && reviewerExists.rows.length === 0) {
      return error(res, "Reviewer not found", 404);
    }

    const result = await pool.query(
      `INSERT INTO performance_reviews
       (
         employee_id,
         reviewer_id,
         review_period,
         rating,
         comments
       )
       VALUES
       ($1,$2,$3,$4,$5)
       RETURNING *`,
      [employee_id, reviewer_id || req.user.userId, review_period, rating, comments || null]
    );

    await notifyEmployee(
      employee_id,
      "Performance Review Added",
      "A new performance review has been added for you"
    );

    return success(res, result.rows[0], 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};
