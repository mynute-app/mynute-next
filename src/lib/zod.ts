import { object, string } from "zod";

export const signInSchema = object({
  email: string().email("Invalid email"),
  password: string({ required_error: "Password is required" }).min(
    1,
    "Password is required"
  ),
  name: string().min(1, "Name is required"), 
});
