import fs from "fs";
import path from "path";
import prisma from "../services/prisma.js";
import {
  businessSchema,
  kycSchema,
  bankSchema,
  storeSchema,
} from "../validators/onboarding.validators.js";

function validationError(res, result) {
  return res.status(400).json({
    message: "Validation failed",
    errors: result.error.flatten().fieldErrors,
  });
}

/** GET /api/seller/onboarding — return the seller's current onboarding state */
async function getOnboarding(req, res, next) {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!profile)
      return res.status(404).json({ message: "Seller profile not found" });
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/seller/onboarding/business — Step 2 */
async function patchBusiness(req, res, next) {
  const parsed = businessSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  try {
    const current = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: { onboardingStep: true, approvalStatus: true },
    });
    if (!current)
      return res.status(404).json({ message: "Seller profile not found" });

    if (current.approvalStatus !== "draft" && current.approvalStatus !== "rejected") {
      return res.status(403).json({ message: "Cannot modify application in its current state" });
    }

    const profile = await prisma.sellerProfile.update({
      where: { userId: req.user.sub },
      data: {
        ...parsed.data,
        // Only advance step forward, never backward
        onboardingStep: Math.max(current.onboardingStep, 2),
      },
    });
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/seller/onboarding/kyc — Step 3 (multipart) */
async function patchKyc(req, res, next) {
  const parsed = kycSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  // All 3 images required
  const { kycFrontImage, kycBackImage, selfieImage } = req.files || {};
  if (!kycFrontImage?.[0] || !kycBackImage?.[0] || !selfieImage?.[0]) {
    return res
      .status(400)
      .json({ message: "All three KYC images are required" });
  }

  try {
    const current = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: {
        onboardingStep: true,
        approvalStatus: true,
        kycFrontImageUrl: true,
        kycBackImageUrl: true,
        selfieImageUrl: true,
      },
    });
    if (!current)
      return res.status(404).json({ message: "Seller profile not found" });

    if (current.approvalStatus !== "draft" && current.approvalStatus !== "rejected") {
      return res.status(403).json({ message: "Cannot modify application in its current state" });
    }

    // Remove old KYC images if they exist
    [
      current.kycFrontImageUrl,
      current.kycBackImageUrl,
      current.selfieImageUrl,
    ].forEach((oldPath) => {
      if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });

    const profile = await prisma.sellerProfile.update({
      where: { userId: req.user.sub },
      data: {
        ...parsed.data,
        kycFrontImageUrl: kycFrontImage[0].path,
        kycBackImageUrl: kycBackImage[0].path,
        selfieImageUrl: selfieImage[0].path,
        onboardingStep: Math.max(current.onboardingStep, 3),
      },
    });
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/seller/onboarding/bank — Step 4 */
async function patchBank(req, res, next) {
  const parsed = bankSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  try {
    const current = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: { onboardingStep: true, approvalStatus: true },
    });
    if (!current)
      return res.status(404).json({ message: "Seller profile not found" });

    if (current.approvalStatus !== "draft" && current.approvalStatus !== "rejected") {
      return res.status(403).json({ message: "Cannot modify application in its current state" });
    }

    const profile = await prisma.sellerProfile.update({
      where: { userId: req.user.sub },
      data: {
        ...parsed.data,
        onboardingStep: Math.max(current.onboardingStep, 4),
      },
    });
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** PATCH /api/seller/onboarding/store — Step 5 (multipart, final submission) */
async function patchStore(req, res, next) {
  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed);

  const { storeLogo, storeBanner } = req.files || {};
  if (!storeLogo?.[0] || !storeBanner?.[0]) {
    return res
      .status(400)
      .json({ message: "Both store logo and banner are required" });
  }

  try {
    const current = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: {
        onboardingStep: true,
        approvalStatus: true,
        storeLogoUrl: true,
        storeBannerUrl: true,
        userId: true,
      },
    });
    if (!current)
      return res.status(404).json({ message: "Seller profile not found" });

    if (current.approvalStatus !== "draft" && current.approvalStatus !== "rejected") {
      return res.status(403).json({ message: "Cannot modify application in its current state" });
    }

    // Remove old store images if they exist
    [current.storeLogoUrl, current.storeBannerUrl].forEach((oldPath) => {
      if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });

    const [profile] = await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { userId: req.user.sub },
        data: {
          ...parsed.data,
          storeLogoUrl: storeLogo[0].path,
          storeBannerUrl: storeBanner[0].path,
          approvalStatus: "pending",
          onboardingStep: Math.max(current.onboardingStep, 5),
        },
      }),
      prisma.notification.create({
        data: {
          userId: current.userId,
          title: "Application Submitted",
          message:
            "Your seller application has been submitted for review. You will be notified once it is processed.",
          type: "seller_submitted",
        },
      }),
    ]);

    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** POST /api/seller/onboarding/resubmit — after rejection */
async function resubmit(req, res, next) {
  try {
    const current = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: { approvalStatus: true, userId: true },
    });
    if (!current)
      return res.status(404).json({ message: "Seller profile not found" });
    if (current.approvalStatus !== "rejected") {
      return res.status(400).json({
        message: "Resubmit is only allowed when the application is rejected",
      });
    }

    const [profile] = await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { userId: req.user.sub },
        data: { approvalStatus: "pending", rejectionReason: null },
      }),
      prisma.notification.create({
        data: {
          userId: current.userId,
          title: "Application Resubmitted",
          message:
            "Your seller application has been resubmitted for review.",
          type: "general",
        },
      }),
    ]);

    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
}

/** GET /api/seller/onboarding/kyc-image/:filename — protected KYC image stream */
async function streamKycImage(req, res, next) {
  try {
    const { filename } = req.params;
    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.resolve("uploads/kyc", safeName);

    // Verify the requesting user owns this image OR is admin
    if (req.user.role !== "admin") {
      const profile = await prisma.sellerProfile.findUnique({
        where: { userId: req.user.sub },
        select: {
          kycFrontImageUrl: true,
          kycBackImageUrl: true,
          selfieImageUrl: true,
        },
      });
      const ownedPaths = [
        profile?.kycFrontImageUrl,
        profile?.kycBackImageUrl,
        profile?.selfieImageUrl,
      ].filter(Boolean).map((p) => path.basename(p));

      if (!ownedPaths.includes(safeName)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.sendFile(filePath, { root: process.cwd() });
  } catch (error) {
    return next(error);
  }
}

export {
  getOnboarding,
  patchBusiness,
  patchKyc,
  patchBank,
  patchStore,
  resubmit,
  streamKycImage,
};
