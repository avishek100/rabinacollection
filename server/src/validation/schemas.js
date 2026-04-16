const { z } = require("zod");

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim(),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(2000),
});

const newsletterSchema = z.object({
  email: z.email().trim(),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  price: z.coerce.number().min(0),
  category: z.string().trim().min(2).max(80),
  image: z.string().trim().min(1),
  images: z.array(z.string().trim().min(1)).min(1),
  description: z.string().trim().min(10).max(3000),
  sizes: z.array(z.string().trim().min(1)).min(1),
  badge: z.string().trim().max(80).optional().default(""),
});

module.exports = {
  contactSchema,
  newsletterSchema,
  categorySchema,
  productSchema,
};
