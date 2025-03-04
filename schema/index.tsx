import * as z from "zod";

export const BusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  // industry: z.string().min(1, "Industry is required"),
  // about: z.string().optional(),
  // contact: z.object({
  //   email: z.string().email("Please enter a valid email"),
  //   phoneNumbers: z
  //     .array(
  //       z.object({
  //         countryCode: z.string().min(1, "Country code is required"),
  //         phone: z.string().min(1, "Phone number is required"),
  //       })
  //     )
  //     .min(1, "At least one phone number is required"),
  // }),
  // location: z.object({
  //   address: z.string().min(1, "Address is required"),
  //   city: z.string().min(1, "City is required"),
  //   state: z.string().min(1, "State is required"),
  //   zipCode: z.string().min(1, "Zip or postal code is required"),
  //   country: z.string().min(1, "Country is required"),
  //   currency: z.string().min(1, "Currency is required"),
  // }),
});

export const teamMemberSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .regex(/^[A-Za-z\s]+$/, "Full name must only contain letters and spaces"),
  email: z.string().email("Invalid email address"),
  permission: z.enum(["No access", "Access only", "Read only", "Edit"]),
});

export const formSchema = z.object({
  teamMembers: z
    .array(teamMemberSchema)
    .nonempty("At least one team member is required"),
});
