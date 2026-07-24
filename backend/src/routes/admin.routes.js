import { Router } from "express";
import {
  approveSeller,
  deactivateSeller,
  getSeller,
  listSellers,
  rejectSeller,
} from "../controllers/admin.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware, roleMiddleware(["admin"]));
router.get("/sellers", listSellers);
router.get("/sellers/:id", getSeller);
router.patch("/sellers/:id/approve", approveSeller);
router.patch("/sellers/:id/reject", rejectSeller);
router.patch("/sellers/:id/deactivate", deactivateSeller);
export default router;
