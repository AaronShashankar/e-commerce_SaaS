import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";
import {
  createAccessToken,
  createRefreshToken,
  refreshCookieOptions,
  requireSecret,
} from "../config/tokens.js";

// Load pepper from env (fallback to requireSecret so it fails loud if missing)
const PASSWORD_PEPPER =
  process.env.PASSWORD_PEPPER || requireSecret("PASSWORD_PEPPER");

function applyPepper(password) {
  // Use HMAC-SHA256 to combine password and pepper safely, avoiding bcrypt's 72-byte limit
  return crypto
    .createHmac("sha256", PASSWORD_PEPPER)
    .update(password)
    .digest("hex");
}

function validationError(res, result) {
  return res.status(400).json({
    message: "Validation failed",
    errors: result.error.flatten().fieldErrors,
  });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    approvalStatus: user.sellerProfile?.approvalStatus ?? null,
    onboardingStep: user.sellerProfile?.onboardingStep ?? null,
  };
}

async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);
  const { email, password, role, firstName, lastName, phone } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(applyPepper(password), 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        phone,
        ...(role === "seller"
          ? {
              sellerProfile: {
                create: { approvalStatus: "draft", onboardingStep: 1 },
              },
            }
          : { buyerProfile: { create: {} } }),
      },
      include: { sellerProfile: true },
    });

    // Both roles get tokens immediately (log them in on register)
    const rawRefreshToken = createRefreshToken(user);
    
    // Store refresh token in DB (expiry is 7 days from now based on tokens.js)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie("refreshToken", rawRefreshToken, refreshCookieOptions);
    const responseData = {
      accessToken: createAccessToken(user),
      user: publicUser(user),
    };
    if (role === "seller") {
      responseData.onboardingRequired = true;
    }
    return res.status(201).json(responseData);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { sellerProfile: true },
    });
    if (
      !user ||
      !(await bcrypt.compare(
        applyPepper(parsed.data.password),
        user.passwordHash,
      ))
    )
      return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive)
      return res.status(403).json({ message: "This account is inactive" });

    const rawRefreshToken = createRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: rawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie("refreshToken", rawRefreshToken, refreshCookieOptions);
    return res.json({
      accessToken: createAccessToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function refreshToken(req, res, next) {
  const oldToken = req.cookies.refreshToken;
  if (!oldToken) return res.status(401).json({ message: "Refresh token missing" });
  try {
    const payload = jwt.verify(oldToken, requireSecret("JWT_REFRESH_SECRET"));
    
    // Check if the token exists in the database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
       return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { sellerProfile: true },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Account is unavailable" });
    }

    // Rotate token: delete the old one, create a new one
    await prisma.refreshToken.delete({ where: { id: dbToken.id } }).catch(() => {});

    const newRawRefreshToken = createRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await prisma.refreshToken.create({
      data: {
        token: newRawRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie("refreshToken", newRawRefreshToken, refreshCookieOptions);
    return res.json({
      accessToken: createAccessToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    )
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    return next(error);
  }
}

async function logout(req, res, next) {
  const token = req.cookies.refreshToken;
  
  try {
    if (token) {
       await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
    }

    res.clearCookie("refreshToken", {
      httpOnly: refreshCookieOptions.httpOnly,
      secure: refreshCookieOptions.secure,
      sameSite: refreshCookieOptions.sameSite,
      path: refreshCookieOptions.path,
      expires: new Date(0),
    });
    return res.status(204).send();
  } catch (error) {
     return next(error);
  }
}

export { register, login, refreshToken, logout };
