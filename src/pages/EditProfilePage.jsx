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
  const [form, setForm] = useState({ firstName: '', bio: '', city: '', gender: '', lookingFor: '', interests: [], occupation: '', company: '', heightCm: '', religion: '', politics: '', children: '', relationshipIntentions: [], sexualOrientations: [], pronouns: [], qualitiesSought: [] });
  const [state, setState] = useState({ loading: true, saving: false, error: '', success: '' });
  const [prompts, setPrompts] = useState([]);
  const [promptDraft, setPromptDraft] = useState({ category: 'about-me', prompt: '', answer: '', photoUrl: '', orderIndex: 0 });

  useEffect(() => {
    profileService.getMyProfile()
      .then(({ profile }) => {
        setForm((current) => ({ ...current,
          firstName: profile?.firstName || '',
          bio: profile?.bio || '',
          city: profile?.city || '',
          gender: profile?.gender || '',
          lookingFor: profile?.lookingFor || '',
          interests: profile?.interests || [],
          occupation: profile?.occupation || '', company: profile?.company || '', heightCm: profile?.heightCm || '', religion: profile?.religion || '', politics: profile?.politics || '', children: profile?.children || '', relationshipIntentions: profile?.relationshipIntentions || [], sexualOrientations: profile?.sexualOrientations || [], pronouns: profile?.pronouns || [], qualitiesSought: profile?.qualitiesSought || [],
        }));
        setState({ loading: false, saving: false, error: '', success: '' });
      })
      .catch((error) => setState({ loading: false, saving: false, error: getApiError(error), success: '' }));
  }, []);
  useEffect(() => { profileService.getPrompts().then((data) => setPrompts(data.prompts || [])).catch(() => {}); }, []);

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
  const addPrompt = async () => { try { const data = await profileService.savePrompt(promptDraft); setPrompts((items) => [...items.filter((item) => item.orderIndex !== data.prompt.orderIndex), data.prompt].sort((a,b) => a.orderIndex-b.orderIndex)); setPromptDraft((value) => ({ ...value, prompt: '', answer: '', photoUrl: '', orderIndex: Math.min(2, value.orderIndex + 1) })); } catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); } };

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
        <div className="grid gap-5 sm:grid-cols-2"><FormInput label="Occupation" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} /><FormInput label="Company" value={form.company} onChange={(e) => update('company', e.target.value)} /><FormInput label="Height (cm)" type="number" min="100" max="250" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} /><FormInput label="Religion" value={form.religion} onChange={(e) => update('religion', e.target.value)} /><FormInput label="Politics" value={form.politics} onChange={(e) => update('politics', e.target.value)} /><FormSelect label="Children" value={form.children} onChange={(e) => update('children', e.target.value)} options={[{value:'',label:'Prefer not to say'},{value:'have-children',label:'Have children'},{value:'want-children',label:'Want children'},{value:'dont-want-children',label:"Don't want children"},{value:'open-to-children',label:'Open to children'}]} /></div>
        {[['relationshipIntentions','Relationship intentions'],['sexualOrientations','Orientations'],['pronouns','Pronouns'],['qualitiesSought','Qualities sought']].map(([key,label]) => <div key={key}><label className="label">{label}</label><input className="input mt-2" value={form[key].join(', ')} onChange={(e) => update(key, e.target.value.split(',').map((v) => v.trim()).filter(Boolean))} placeholder="Comma separated" /></div>)}
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
        <div className="border-t border-coral-100 pt-5"><h2 className="text-2xl">Profile prompts</h2><p className="mt-1 text-sm text-slate-500">Add up to three text or photo prompts. New edits are reviewed before public display.</p><div className="mt-4 space-y-3">{prompts.map((item) => <div key={item._id} className="rounded-2xl bg-orange-50 p-4"><p className="font-semibold">{item.prompt}</p><p className="mt-1 text-slate-600">{item.answer}</p><button type="button" className="mt-2 text-sm text-rose-500" onClick={async () => { await profileService.deletePrompt(item._id); setPrompts((values) => values.filter((value) => value._id !== item._id)); }}>Remove</button></div>)}</div>{prompts.length < 3 && <div className="mt-4 grid gap-3"><FormSelect label="Category" value={promptDraft.category} onChange={(e) => setPromptDraft({...promptDraft,category:e.target.value})} options={['about-me','values','dating','lifestyle','fun'].map((value) => ({value,label:value.replace('-',' ')}))} /><FormInput label="Prompt" value={promptDraft.prompt} onChange={(e) => setPromptDraft({...promptDraft,prompt:e.target.value})} /><FormInput label="Answer" value={promptDraft.answer} onChange={(e) => setPromptDraft({...promptDraft,answer:e.target.value})} /><FormInput label="Optional photo URL" value={promptDraft.photoUrl} onChange={(e) => setPromptDraft({...promptDraft,photoUrl:e.target.value})} /><button type="button" onClick={addPrompt} className="btn-secondary rounded-xl px-4 py-3">Add prompt</button></div>}</div>
      </form>
    </section>
  );
}
