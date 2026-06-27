import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';
import FormInput from '../../components/FormInput';
import LoadingButton from '../../components/LoadingButton';
import { loginUser } from '../../redux/slices/authSlice';
import { loginSchema } from '../../utils/validation';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });
  const submit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.user.role === 'admin') navigate('/admin/dashboard');
      else dispatch({ type: 'auth/logout' });
    }
  };
  return <main className="flex min-h-screen items-center justify-center p-4"><div className="glass w-full max-w-md rounded-3xl p-8"><h1 className="text-center text-3xl">Admin access</h1><p className="mt-2 text-center text-white/45">Authorized CyberNest staff only</p><form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5"><Alert>{error}</Alert><FormInput label="Admin email" type="email" error={errors.email} {...register('email')} /><FormInput label="Password" type="password" error={errors.password} {...register('password')} /><LoadingButton isLoading={isLoading}>Sign in</LoadingButton></form></div></main>;
}
