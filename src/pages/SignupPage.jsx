import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { clearAuthError, registerUser } from '../redux/slices/authSlice';
import { signupSchema } from '../utils/validation';

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);
  const onSubmit = async (formData) => {
    const result = await dispatch(registerUser({ email: formData.email, password: formData.password }));
    if (registerUser.fulfilled.match(result)) navigate('/profile/setup');
  };

  return (
    <>
      <h1 className="text-center text-3xl">Create your nest</h1>
      <p className="mt-2 text-center text-white/50">A few details and you’re on your way.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Alert>{error}</Alert>
        <FormInput label="Email address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} {...register('email')} />
        <FormInput label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" error={errors.password} {...register('password')} />
        <FormInput label="Confirm password" type="password" placeholder="Enter it again" autoComplete="new-password" error={errors.confirmPassword} {...register('confirmPassword')} />
        <LoadingButton type="submit" isLoading={isLoading}>Create account</LoadingButton>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">Already have an account? <Link className="font-semibold text-pink-300 hover:text-pink-200" to="/login">Log in</Link></p>
    </>
  );
}
