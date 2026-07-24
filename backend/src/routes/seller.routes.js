import { Router } from "express";
import { getMySellerProfile } from "../controllers/seller.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();
router.get(
  "/me",
  authMiddleware,
  roleMiddleware(["seller"]),
  getMySellerProfile,
);
export default router;
