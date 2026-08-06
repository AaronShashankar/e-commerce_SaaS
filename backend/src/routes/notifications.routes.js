import { Router } from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notifications.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", listNotifications);
// read-all MUST come before /:id/read to avoid route conflict
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
