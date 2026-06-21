const pool = require("../config/db");
const { success, error } = require("../utils/apiResponse");

exports.getDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY id"
    );

    return success(res, result.rows);

  } catch (err) {

    return error(res, err.message, 500);

  }
};
