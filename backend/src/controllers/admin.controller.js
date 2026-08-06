import prisma from "../services/prisma.js";
import { rejectSchema } from "../validators/onboarding.validators.js";

const sellerInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  },
};

function serializeSeller(seller) {
  return {
    id: seller.id,
    userId: seller.userId,
    // Step 2
    storeName: seller.storeName,
    businessType: seller.businessType,
    panOrVatNumber: seller.panOrVatNumber,
    businessAddress: seller.businessAddress,
    // Step 3
    kycType: seller.kycType,
    kycNumber: seller.kycNumber,
    kycFrontImageUrl: seller.kycFrontImageUrl,
    kycBackImageUrl: seller.kycBackImageUrl,
    selfieImageUrl: seller.selfieImageUrl,
    // Step 4
    bankName: seller.bankName,
    accountHolderName: seller.accountHolderName,
    accountNumber: seller.accountNumber,
    branchName: seller.branchName,
    // Step 5
    storeLogoUrl: seller.storeLogoUrl,
    storeBannerUrl: seller.storeBannerUrl,
    storeDescription: seller.storeDescription,
    pickupLocation: seller.pickupLocation,
    // Status
    onboardingStep: seller.onboardingStep,
    approvalStatus: seller.approvalStatus,
    rejectionReason: seller.rejectionReason,
    createdAt: seller.createdAt,
    user: seller.user,
  };
}

async function listSellers(req, res, next) {
  const { status } = req.query;
  const validStatuses = ["draft", "pending", "approved", "rejected"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid seller status filter" });
  }
  try {
    const sellers = await prisma.sellerProfile.findMany({
      where: status ? { approvalStatus: status } : undefined,
      include: sellerInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ sellers: sellers.map(serializeSeller) });
  } catch (error) {
    return next(error);
  }
}

async function getSeller(req, res, next) {
  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: req.params.id },
      include: sellerInclude,
    });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    return res.json({ seller: serializeSeller(seller) });
  } catch (error) {
    return next(error);
  }
}

async function approveSeller(req, res, next) {
  try {
    const seller = await prisma.$transaction(async (tx) => {
      const found = await tx.sellerProfile.findUnique({
        where: { id: req.params.id },
      });
      if (!found) return null;

      const updated = await tx.sellerProfile.update({
        where: { id: req.params.id },
        data: { approvalStatus: "approved", rejectionReason: null },
        include: sellerInclude,
      });

      await tx.auditLog.create({
        data: {
          adminId: req.user.sub,
          action: "approved_seller",
          targetTable: "SellerProfile",
          targetId: updated.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: found.userId,
          title: "Application Approved!",
          message:
            "Congratulations! Your seller application has been approved. You can now start listing products.",
          type: "seller_approved",
        },
      });

      return updated;
    });

    if (!seller) return res.status(404).json({ message: "Seller not found" });
    return res.json({ seller: serializeSeller(seller) });
  } catch (error) {
    return next(error);
  }
}

async function rejectSeller(req, res, next) {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const seller = await prisma.$transaction(async (tx) => {
      const found = await tx.sellerProfile.findUnique({
        where: { id: req.params.id },
      });
      if (!found) return null;

      const updated = await tx.sellerProfile.update({
        where: { id: req.params.id },
        data: {
          approvalStatus: "rejected",
          rejectionReason: parsed.data.reason,
        },
        include: sellerInclude,
      });

      await tx.auditLog.create({
        data: {
          adminId: req.user.sub,
          action: "rejected_seller",
          targetTable: "SellerProfile",
          targetId: updated.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: found.userId,
          title: "Application Rejected",
          message: `Your seller application was not approved. Reason: ${parsed.data.reason}`,
          type: "seller_rejected",
        },
      });

      return updated;
    });

    if (!seller) return res.status(404).json({ message: "Seller not found" });
    return res.json({ seller: serializeSeller(seller) });
  } catch (error) {
    return next(error);
  }
}

async function deactivateSeller(req, res, next) {
  try {
    const seller = await prisma.$transaction(async (tx) => {
      const found = await tx.sellerProfile.findUnique({
        where: { id: req.params.id },
      });
      if (!found) return null;
      const updatedUser = await tx.user.update({
        where: { id: found.userId },
        data: { isActive: false },
      });
      await tx.auditLog.create({
        data: {
          adminId: req.user.sub,
          action: "deactivated_seller",
          targetTable: "User",
          targetId: updatedUser.id,
        },
      });
      return tx.sellerProfile.findUnique({
        where: { id: found.id },
        include: sellerInclude,
      });
    });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    return res.json({ seller: serializeSeller(seller) });
  } catch (error) {
    return next(error);
  }
}

export {
  listSellers,
  getSeller,
  approveSeller,
  rejectSeller,
  deactivateSeller,
};
