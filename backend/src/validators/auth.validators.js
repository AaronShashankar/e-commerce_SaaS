import { z } from "zod";

const email = z.string().trim().email("Enter a valid email address").max(255);

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72)
  .refine((v) => /\d/.test(v), "Password must contain at least one number");

const firstName = z
  .string()
  .trim()
  .min(1, "First name is required")
  .max(60, "First name is too long");

const lastName = z
  .string()
  .trim()
  .min(1, "Last name is required")
  .max(60, "Last name is too long");

// Loose phone: 7–15 chars, digits/spaces/dashes/plus
const phone = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s\-]{7,15}$/, "Enter a valid phone number");

const registerSchema = z
  .object({
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["seller", "buyer"]),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export { registerSchema, loginSchema };
