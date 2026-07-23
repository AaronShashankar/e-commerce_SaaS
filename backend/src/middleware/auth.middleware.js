const jwt = require("jsonwebtoken");
const { requireSecret } = require("../config/tokens");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(token, requireSecret("JWT_ACCESS_SECRET"));
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "You are not authorized to access this resource" });
    next();
  };
}

module.exports = { authMiddleware, roleMiddleware };
