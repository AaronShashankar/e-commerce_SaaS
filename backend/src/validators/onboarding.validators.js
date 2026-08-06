import { z } from "zod";

// Step 2 — Business Info
export const businessSchema = z.object({
  storeName: z.string().trim().min(2, "Store name must be at least 2 characters").max(120),
  businessType: z.string().trim().min(2, "Business type is required").max(100),
  panOrVatNumber: z
    .string()
    .trim()
    .min(5, "PAN/VAT number is required")
    .max(20),
  businessAddress: z
    .string()
    .trim()
    .min(5, "Business address must be at least 5 characters")
    .max(300),
});

// Step 3 — KYC
// Nepal citizenship: alphanumeric + dashes, 5–20 chars (e.g. 12-34-56-78901)
// NID (National ID): exactly 10 digits
export const kycSchema = z
  .object({
    kycType: z.enum(["citizenship", "nid"], {
      required_error: "KYC type is required",
    }),
    kycNumber: z.string().trim().min(1, "KYC number is required"),
  })
  .superRefine(({ kycType, kycNumber }, ctx) => {
    if (kycType === "citizenship" && !/^[a-zA-Z0-9\-]{5,20}$/.test(kycNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["kycNumber"],
        message: "Citizenship number must be 5–20 alphanumeric characters (hyphens allowed)",
      });
    }
    if (kycType === "nid" && !/^\d{10}$/.test(kycNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["kycNumber"],
        message: "NID must be exactly 10 digits",
      });
    }
  });

// Step 4 — Bank Details
export const bankSchema = z.object({
  bankName: z.string().trim().min(2, "Bank name is required").max(100),
  accountHolderName: z
    .string()
    .trim()
    .min(2, "Account holder name is required")
    .max(120),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,20}$/, "Account number must be 8–20 digits"),
  branchName: z.string().trim().min(2, "Branch name is required").max(100),
});

// Step 5 — Store Profile
export const storeSchema = z.object({
  storeDescription: z
    .string()
    .trim()
    .min(10, "Store description must be at least 10 characters")
    .max(1000),
  pickupLocation: z
    .string()
    .trim()
    .min(3, "Pickup location is required")
    .max(300),
});

// Admin reject reason
export const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500),
});
