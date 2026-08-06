import jwt from "jsonwebtoken";
import { requireSecret } from "../config/tokens.js";
import prisma from "../services/prisma.js";

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const payload = jwt.verify(token, requireSecret("JWT_ACCESS_SECRET"));
    
    // Check database to ensure user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is inactive or unavailable" });
    }

    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role))
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    next();
  };
}

export { authMiddleware, roleMiddleware };
