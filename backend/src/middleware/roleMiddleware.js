const { error } = require("../utils/apiResponse");

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    let roleId = req.user.roleId || req.user.role_id;
    if (!roleId) {
      roleId = 4; // Default to Employee if missing
    }

    const roleMapping = {
      1: "ADMIN",
      2: "SENIOR_MANAGER",
      3: "HR_RECRUITER",
      4: "EMPLOYEE"
    };

    const userRole = roleMapping[roleId];

    // allowedRoles can be an array of IDs or Strings. Flatten them for easy checking.
    const isAllowed = allowedRoles.flat().some(role => 
      String(role) === String(roleId) || role === userRole
    );

    if (!isAllowed) {
      return error(res, `Access denied. Required roles: ${allowedRoles.flat().join(", ")}`, 403);
    }

    next();
  };
};

module.exports = authorizeRole;
