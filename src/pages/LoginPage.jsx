import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import { clearAuthError, loginUser } from '../redux/slices/authSlice';
import profileService from '../services/profileService';
import { loginSchema } from '../utils/validation';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);
  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      try {
        const profile = await profileService.getMyProfile();
        navigate(location.state?.from?.pathname || (profile.profileCompleted ? '/discover' : '/profile/setup'), { replace: true });
      } catch {
        navigate('/profile/setup', { replace: true });
      }
    }
  };

  return (
    <>
      <h1 className="text-center text-3xl">Welcome back</h1>
      <p className="mt-2 text-center text-white/50">Your nest missed you.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Alert>{error}</Alert>
        <FormInput label="Email address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} {...register('email')} />
        <div>
          <div className="mb-2 flex justify-between"><span className="text-sm font-medium text-white/75">Password</span><Link className="text-sm text-pink-300 hover:text-pink-200" to="/forgot-password">Forgot password?</Link></div>
          <input className="input" type="password" placeholder="Your password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>
        <LoadingButton type="submit" isLoading={isLoading}>Log in</LoadingButton>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">New to CyberNest? <Link className="font-semibold text-pink-300 hover:text-pink-200" to="/signup">Create an account</Link></p>
    </>
  );
}
