import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
