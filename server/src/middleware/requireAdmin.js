const { env } = require("../config/env");

function requireAdmin(req, res, next) {
  const adminKey = req.header("x-admin-key");

  if (!adminKey || adminKey !== env.adminApiKey) {
    return res.status(401).json({
      message: "Unauthorized admin request",
    });
  }

  return next();
}

module.exports = {
  requireAdmin,
};
