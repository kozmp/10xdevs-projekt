import { z } from "zod";

/**
 * Schemat walidacji dla rejestracji użytkownika
 */
export const signupSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email").min(1, "Email jest wymagany"),
  password: z
    .string()
    .min(8, "Hasło musi mieć minimum 8 znaków")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Hasło musi zawierać przynajmniej jedną małą literę, wielką literę i cyfrę"
    ),
  termsAccepted: z.boolean().refine((val) => val === true, "Musisz zaakceptować regulamin"),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Schemat walidacji dla logowania użytkownika
 */
export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email").min(1, "Email jest wymagany"),
  password: z.string().min(1, "Hasło jest wymagane"),
});
