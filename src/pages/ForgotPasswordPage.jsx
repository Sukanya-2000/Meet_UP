import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import authService from '../services/authService';
import { getApiError } from '../utils/apiError';
import { emailSchema } from '../utils/validation';

export default function ForgotPasswordPage() {
  const [state, setState] = useState({ loading: false, error: '', success: '' });
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(emailSchema) });
  const onSubmit = async (data) => {
    setState({ loading: true, error: '', success: '' });
    try {
      const response = await authService.forgotPassword(data);
      setState({ loading: false, error: '', success: response.message });
    } catch (error) {
      setState({ loading: false, error: getApiError(error), success: '' });
    }
  };

  return (
    <>
      <h1 className="text-center text-3xl">Reset your password</h1>
      <p className="mt-2 text-center text-white/50">Enter your email and we’ll send instructions if an account exists.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Alert>{state.error}</Alert>
        <Alert type="success">{state.success}</Alert>
        <FormInput label="Email address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email} {...register('email')} />
        <LoadingButton type="submit" isLoading={state.loading}>Send reset instructions</LoadingButton>
      </form>
      <Link className="mt-6 flex items-center justify-center gap-2 text-sm text-pink-300 hover:text-pink-200" to="/login"><ArrowLeft size={15} /> Back to login</Link>
    </>
  );
}
