const jwt = require("jsonwebtoken");

const accessTokenOptions = { expiresIn: "15m" };
const refreshTokenOptions = { expiresIn: "7d" };

function requireSecret(name) {
  const value = process.env[name];
  if (!value || value.startsWith("replace_with_")) {
    throw new Error(`${name} must be configured`);
  }
  return value;
}

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, requireSecret("JWT_ACCESS_SECRET"), accessTokenOptions);
}

function createRefreshToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, requireSecret("JWT_REFRESH_SECRET"), refreshTokenOptions);
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = { createAccessToken, createRefreshToken, refreshCookieOptions, requireSecret };
