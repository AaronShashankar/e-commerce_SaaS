import { Router } from "express";
import { getMySellerProfile } from "../controllers/seller.controller.js";
import {
  getOnboarding,
  patchBusiness,
  patchKyc,
  patchBank,
  patchStore,
  resubmit,
  streamKycImage,
} from "../controllers/onboarding.controller.js";
import {
  authMiddleware,
  roleMiddleware,
} from "../middleware/auth.middleware.js";
import { kycUpload, storeUpload } from "../config/upload.js";

const router = Router();

// Existing profile route
router.get("/me", authMiddleware, roleMiddleware(["seller"]), getMySellerProfile);

// Protected KYC image stream — accessible by owning seller OR admin
router.get(
  "/onboarding/kyc-image/:filename",
  authMiddleware,
  roleMiddleware(["seller", "admin"]),
  streamKycImage,
);

// Onboarding routes — seller only
const onboardingRouter = Router();
onboardingRouter.use(authMiddleware, roleMiddleware(["seller"]));

onboardingRouter.get("/", getOnboarding);
onboardingRouter.patch("/business", patchBusiness);
onboardingRouter.patch(
  "/kyc",
  kycUpload.fields([
    { name: "kycFrontImage", maxCount: 1 },
    { name: "kycBackImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  patchKyc,
);
onboardingRouter.patch("/bank", patchBank);
onboardingRouter.patch(
  "/store",
  storeUpload.fields([
    { name: "storeLogo", maxCount: 1 },
    { name: "storeBanner", maxCount: 1 },
  ]),
  patchStore,
);
onboardingRouter.post("/resubmit", resubmit);

router.use("/onboarding", onboardingRouter);

export default router;
