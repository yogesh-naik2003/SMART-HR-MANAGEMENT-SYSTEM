const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roleId)) {
      return res.status(403).json({
        message: "Access Denied"
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
