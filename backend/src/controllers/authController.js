const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { success, error } = require("../utils/apiResponse");

exports.register = async (req, res) => {
  try {
    const { name, email, password, roleId = 4 } = req.body;

    if (!name || !email || !password) {
      return error(res, "Name, email and password are required", 400);
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return error(res, "User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role_id`,
      [name, email, passwordHash, roleId]
    );

    return success(res, {
      message: "User registered successfully",
      user: createdUser.rows[0]
    }, 201);
  } catch (err) {
    console.error(err);

    return error(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const body = req.body || {};
    const email = body.email || body.username;
    const { password } = body;

    if (!email || !password) {
      return error(res, "Email and password are required", 400);
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return error(res, "User not found", 401);
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return error(res, "Invalid password", 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.role_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    success(res, {
      message: "Login successful",
      token
    });

  } catch (err) {

    console.error(err);

    error(res, err.message, 500);

  }
};
