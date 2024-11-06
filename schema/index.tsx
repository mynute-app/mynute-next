import * as z from "zod";

export const BusinessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  about: z.string().optional(),
  contact: z.object({
    email: z.string().email("Please enter a valid email"),
    phoneNumbers: z
      .array(
        z.object({
          countryCode: z.string().min(1, "Country code is required"),
          phone: z.string().min(1, "Phone number is required"),
        })
      )
      .min(1, "At least one phone number is required"),
  }),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip or postal code is required"),
    country: z.string().min(1, "Country is required"),
    currency: z.string().min(1, "Currency is required"),
  }),
});
