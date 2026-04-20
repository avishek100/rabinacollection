function requireAdmin(req, res, next) {
  const adminKey = req.header("x-admin-key");
  const expected = process.env.ADMIN_API_KEY || "";

  if (!adminKey || adminKey !== expected) {
    return res.status(401).json({
      message: "Unauthorized admin request",
    });
  }

  return next();
}

module.exports = {
  requireAdmin,
};
