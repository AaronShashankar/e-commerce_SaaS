const { z } = require("zod");

const email = z.string().trim().email("Enter a valid email address").max(255);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);

const registerSchema = z.object({
  email,
  password,
  role: z.enum(["seller", "buyer"]),
  businessName: z.string().trim().min(2).max(120).optional(),
  businessAddress: z.string().trim().min(5).max(300).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "seller" && !data.businessName) ctx.addIssue({ code: "custom", path: ["businessName"], message: "Business name is required for sellers" });
  if (data.role === "seller" && !data.businessAddress) ctx.addIssue({ code: "custom", path: ["businessAddress"], message: "Business address is required for sellers" });
});

const loginSchema = z.object({ email, password: z.string().min(1, "Password is required") });

module.exports = { registerSchema, loginSchema };
