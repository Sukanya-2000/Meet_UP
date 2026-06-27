import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
  dob: z.string().refine((value) => {
    const date = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const month = today.getMonth() - date.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < date.getDate())) age -= 1;
    return !Number.isNaN(date.getTime()) && age >= 18;
  }, 'You must be at least 18 years old'),
  gender: z.enum(['man', 'woman', 'non-binary', 'other'], { required_error: 'Select your gender' }),
  lookingFor: z.enum(['man', 'woman', 'everyone'], { required_error: 'Select who you are looking for' }),
  city: z.string().trim().min(2, 'Enter your city').max(80),
});
