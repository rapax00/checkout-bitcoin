import { z } from "zod";

export const ticketSchema = z.object({
  fullname: z.string().min(3, { message: "Fullname is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  qty: z.number().int().lt(1000).positive({ message: "Qty Must be a number" }),
  isSubscribed: z.boolean({ message: "isSubscribed must be a boolean" }),
});
