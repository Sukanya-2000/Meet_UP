import { BookOpen, Camera, Coffee, Dumbbell, Gamepad2, Music2, Plane, Popcorn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingButton from '../components/LoadingButton';
import profileService from '../services/profileService';
import { getApiError } from '../utils/apiError';

const interestOptions = [
  { name: 'Coffee', icon: <Coffee size={20} /> }, { name: 'Travel', icon: <Plane size={20} /> },
  { name: 'Fitness', icon: <Dumbbell size={20} /> }, { name: 'Movies', icon: <Popcorn size={20} /> },
  { name: 'Music', icon: <Music2 size={20} /> }, { name: 'Books', icon: <BookOpen size={20} /> },
  { name: 'Photography', icon: <Camera size={20} /> }, { name: 'Gaming', icon: <Gamepad2 size={20} /> },
];

const genderOptions = [
  { value: 'man', label: 'Man' }, { value: 'woman', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' }, { value: 'other', label: 'Other' },
];
const lookingOptions = [
  { value: 'man', label: 'Men' }, { value: 'woman', label: 'Women' }, { value: 'everyone', label: 'Everyone' },
];

export default function EditProfilePage() {
  const [form, setForm] = useState({ firstName: '', bio: '', city: '', gender: '', lookingFor: '', interests: [] });
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });

  useEffect(() => {
    profileService.getMyProfile()
      .then(({ profile }) => {
        setForm({
          firstName: profile?.firstName || '',
          bio: profile?.bio || '',
          city: profile?.city || '',
          gender: profile?.gender || '',
          lookingFor: profile?.lookingFor || '',
          interests: profile?.interests || [],
        });
        setState({ loading: false, saving: false, error: '', success: '' });
      })
      .catch((error) => setState({ loading: false, saving: false, error: getApiError(error), success: '' }));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleInterest = (name) => update('interests', form.interests.includes(name)
    ? form.interests.filter((item) => item !== name)
    : [...form.interests, name]);

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: false, saving: true, error: '', success: '' });
    try {
      const response = await profileService.updateProfile(form);
      setForm((current) => ({ ...current, ...response.profile }));
      setState({ loading: false, saving: false, error: '', success: 'Profile updated successfully.' });
    } catch (error) {
      setState({ loading: false, saving: false, error: getApiError(error), success: '' });
    }
  };

  if (state.loading) return <div className="card mx-auto max-w-3xl p-8 text-slate-600">Loading profile...</div>;

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wider text-coral-500">Profile</p>
        <h1 className="mt-1 text-3xl">Edit your nest</h1>
        <p className="mt-2 text-slate-600">Update the details people see after onboarding.</p>
      </div>
      <form onSubmit={submit} className="card space-y-5 p-6">
        <Alert>{state.error || state.success}</Alert>
        <FormInput label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} />
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-28" maxLength={500} value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="A tiny spark about you..." />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormSelect label="I am..." options={genderOptions} value={form.gender} onChange={(event) => update('gender', event.target.value)} />
          <FormSelect label="Looking for..." options={lookingOptions} value={form.lookingFor} onChange={(event) => update('lookingFor', event.target.value)} />
        </div>
        <FormInput label="City" value={form.city} onChange={(event) => update('city', event.target.value)} />
        <div>
          <label className="label mb-3">Interests</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {interestOptions.map(({ name, icon }) => {
              const active = form.interests.includes(name);
              return (
                <button type="button" key={name} onClick={() => toggleInterest(name)} className={`rounded-2xl border p-4 text-sm font-semibold transition ${active ? 'border-coral-400 bg-rose-100 text-rose-700' : 'border-coral-100 bg-white/90 text-slate-700 hover:border-coral-300'}`}>
                  <span className="mb-2 flex justify-center">{icon}</span>{name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LoadingButton type="submit" isLoading={state.saving}>Save profile</LoadingButton>
          <Link className="btn-secondary flex items-center justify-center rounded-xl px-5" to="/profile/photos">Manage photos</Link>
        </div>
      </form>
    </section>
  );
}
