import prisma from "../services/prisma.js";

async function requireApprovedSeller(req, res, next) {
  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
      select: { approvalStatus: true, user: { select: { isActive: true } } },
    });

    if (!seller?.user.isActive) {
      return res.status(403).json({ message: "This account is inactive" });
    }
    if (seller.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Your seller account is pending admin approval",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export { requireApprovedSeller };
