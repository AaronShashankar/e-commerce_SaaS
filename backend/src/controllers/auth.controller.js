const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../services/prisma");
const { registerSchema, loginSchema } = require("../validators/auth.validators");
const { createAccessToken, createRefreshToken, refreshCookieOptions, requireSecret } = require("../config/tokens");

function validationError(res, result) {
  return res.status(400).json({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    approvalStatus: user.sellerProfile?.approvalStatus,
  };
}

async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);
  const { email, password, role, businessName, businessAddress } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        ...(role === "seller"
          ? { sellerProfile: { create: { businessName, businessAddress } } }
          : { buyerProfile: { create: {} } }),
      },
      include: { sellerProfile: true },
    });
    return res.status(201).json({ message: "Registration successful", user: publicUser(user) });
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, include: { sellerProfile: true } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ message: "This account is inactive" });
    res.cookie("refreshToken", createRefreshToken(user), refreshCookieOptions);
    return res.json({ accessToken: createAccessToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
}

async function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });
  try {
    const payload = jwt.verify(token, requireSecret("JWT_REFRESH_SECRET"));
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { sellerProfile: true } });
    if (!user || !user.isActive) return res.status(401).json({ message: "Account is unavailable" });
    return res.json({ accessToken: createAccessToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") return res.status(401).json({ message: "Invalid or expired refresh token" });
    return next(error);
  }
}

function logout(req, res) {
  res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: undefined });
  return res.status(204).send();
}

module.exports = { register, login, refreshToken, logout };
