import prisma from "../services/prisma.js";

async function getMySellerProfile(req, res, next) {
  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!seller)
      return res.status(404).json({ message: "Seller profile not found" });
    return res.json({ seller });
  } catch (error) {
    return next(error);
  }
}

export { getMySellerProfile };
