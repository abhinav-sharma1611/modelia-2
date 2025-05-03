import { z } from "zod";

export const ProductFormSchema = z.object({
  title: z.string().min(3, {
    message: "Product title must be at least 3 characters.",
  }).max(100, {
    message: "Product title must not exceed 100 characters.",
  }),
  category: z.enum(["T-shirt", "Dress", "Hoodie"], {
    required_error: "You need to select a product category.",
  }),
  tags: z.string().optional(), // Tags are optional, validation can be added if needed e.g., regex for comma separation
});

// You can define other schemas here if needed
