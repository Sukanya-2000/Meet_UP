import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingButton from '../components/LoadingButton';
import useAuth from '../hooks/useAuth';
import profileService from '../services/profileService';
import { getApiError } from '../utils/apiError';
import { profileSchema } from '../utils/validation';

const genderOptions = [
  { value: 'man', label: 'Man' }, { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' }, { value: 'other', label: 'Other' },
];
const lookingOptions = [
  { value: 'man', label: 'Men' }, { value: 'woman', label: 'Women' }, { value: 'everyone', label: 'Everyone' },
];

export default function ProfileSetupPage() {
  const [state, setState] = useState({ loading: false, error: '', success: false });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(profileSchema) });
  const onSubmit = async (data) => {
    setState({ loading: true, error: '', success: false });
    try {
      await profileService.saveBasicProfile(data);
      navigate('/profile/interests');
    } catch (error) {
      setState({ loading: false, error: getApiError(error), success: false });
    }
  };
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-semibold text-pink-300">STEP 1 OF 3</p><h1 className="mt-1 text-3xl">Tell us about you</h1></div>
        <button onClick={handleLogout} title="Log out" className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
      </div>
      <p className="mt-2 text-white/50">The basics help us personalize your future experience.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Alert>{state.error}</Alert>
        <FormInput label="First name" placeholder="What should we call you?" autoComplete="given-name" error={errors.firstName} {...register('firstName')} />
        <FormInput label="Date of birth" type="date" max={new Date().toISOString().split('T')[0]} error={errors.dob} {...register('dob')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect label="I am a…" options={genderOptions} error={errors.gender} {...register('gender')} />
          <FormSelect label="Looking for…" options={lookingOptions} error={errors.lookingFor} {...register('lookingFor')} />
        </div>
        <FormInput label="City" placeholder="e.g. Bengaluru" autoComplete="address-level2" error={errors.city} {...register('city')} />
        <LoadingButton type="submit" isLoading={state.loading}>Complete profile</LoadingButton>
      </form>
    </>
  );
}
