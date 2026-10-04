import { z } from 'zod';

export const bookingSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^\+?[0-9 ()-]+$/, 'Nomor WhatsApp tidak valid.'),
  event_type: z.string().trim().min(2).max(60),
  event_name: z.string().trim().max(120).optional().or(z.literal('')),
  event_date: z.iso.date(),
  event_time: z.string().trim().min(3).max(30),
  location: z.string().trim().min(3).max(200),
  location_detail: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
