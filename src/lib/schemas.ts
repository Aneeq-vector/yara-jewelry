import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(8, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfirm: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a positive integer"),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
});

const orderSchema = z.object({
  total_amount: z.number().min(0),
  shipping_address: z.string().min(5, "Shipping address is required"),
});
