import prisma from "../services/prisma.js";

const sellerInclude = {
  user: { select: { id: true, email: true, isActive: true, createdAt: true } },
};

function serializeSeller(seller) {
  return {
    id: seller.id,
    userId: seller.userId,
    businessName: seller.businessName,
    businessAddress: seller.businessAddress,
    approvalStatus: seller.approvalStatus,
    rejectionReason: seller.rejectionReason,
    createdAt: seller.createdAt,
    user: seller.user,
  };
}

async function listSellers(req, res, next) {
  const { status } = req.query;
  if (status && !["pending", "approved", "rejected"].includes(status)) {
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

async function updateSellerStatus(req, res, next, approvalStatus, action) {
  if (req.body?.reason !== undefined && typeof req.body.reason !== "string") {
    return res
      .status(400)
      .json({ message: "Rejection reason must be a string" });
  }
  try {
    const seller = await prisma.$transaction(async (tx) => {
      const found = await tx.sellerProfile.findUnique({
        where: { id: req.params.id },
      });
      if (!found) return null;
      const updated = await tx.sellerProfile.update({
        where: { id: req.params.id },
        data:
          approvalStatus === "rejected"
            ? {
                approvalStatus,
                rejectionReason: req.body?.reason?.trim() || null,
              }
            : { approvalStatus, rejectionReason: null },
        include: sellerInclude,
      });
      await tx.auditLog.create({
        data: {
          adminId: req.user.sub,
          action,
          targetTable: "SellerProfile",
          targetId: updated.id,
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

function approveSeller(req, res, next) {
  return updateSellerStatus(req, res, next, "approved", "approved_seller");
}
function rejectSeller(req, res, next) {
  return updateSellerStatus(req, res, next, "rejected", "rejected_seller");
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
