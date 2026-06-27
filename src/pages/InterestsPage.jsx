import { BookOpen, Camera, Coffee, Dumbbell, Gamepad2, LogOut, Music2, Plane, Popcorn } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingButton from '../components/LoadingButton';
import useAuth from '../hooks/useAuth';
import profileService from '../services/profileService';
import { getApiError } from '../utils/apiError';

const options = [
  { name: 'Coffee', icon: <Coffee size={25} /> }, { name: 'Travel', icon: <Plane size={25} /> },
  { name: 'Fitness', icon: <Dumbbell size={25} /> }, { name: 'Movies', icon: <Popcorn size={25} /> },
  { name: 'Music', icon: <Music2 size={25} /> }, { name: 'Books', icon: <BookOpen size={25} /> },
  { name: 'Photography', icon: <Camera size={25} /> }, { name: 'Gaming', icon: <Gamepad2 size={25} /> },
];

export default function InterestsPage() {
  const [selected, setSelected] = useState([]);
  const [state, setState] = useState({ loading: false, error: '' });
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toggle = (name) => setSelected((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  const submit = async () => {
    if (!selected.length) return setState({ loading: false, error: 'Choose at least one interest' });
    setState({ loading: true, error: '' });
    try {
      await profileService.saveInterests(selected);
      navigate('/profile/photos');
    } catch (error) {
      setState({ loading: false, error: getApiError(error) });
    }
  };
  const signOut = () => { logout(); navigate('/'); };

  return (
    <>
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-semibold text-pink-300">STEP 2 OF 3</p><h1 className="mt-1 text-3xl">What lights you up?</h1></div>
        <button onClick={signOut} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
      </div>
      <p className="mt-2 text-white/50">Pick the things you would happily talk about for hours.</p>
      <div className="mt-7"><Alert>{state.error}</Alert></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map(({ name, icon }) => {
          const active = selected.includes(name);
          return (
            <button type="button" onClick={() => toggle(name)} key={name} className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border transition ${active ? 'border-pink-400 bg-gradient-to-br from-pink-500/25 to-purple-500/20 text-pink-100 shadow-lg shadow-pink-950/30' : 'border-white/10 bg-white/[.04] text-white/55 hover:border-white/20 hover:bg-white/[.07]'}`}>
              {icon}<span className="text-sm font-semibold">{name}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-7"><LoadingButton type="button" onClick={submit} isLoading={state.loading}>Continue to photos</LoadingButton></div>
    </>
  );
}
