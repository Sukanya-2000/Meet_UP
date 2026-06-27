import { Check, Heart, LoaderCircle, MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import MatchModal from '../components/MatchModal';
import likesService from '../services/likesService';
import { getApiError } from '../utils/apiError';

const ageFromDob = (dob) => {
  const born = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  if (today < new Date(today.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age;
};

export default function LikedYouPage() {
  const [likes, setLikes] = useState([]);
  const [sentLikes, setSentLikes] = useState([]);
  const [tab, setTab] = useState('sent');
  const [match, setMatch] = useState(null);
  const [state, setState] = useState({ loading: true, error: '' });
  const load = useCallback(async () => {
    try {
      const [received, sent] = await Promise.all([likesService.received(), likesService.sent()]);
      setLikes(received);
      setSentLikes(sent);
      setState({ loading: false, error: '' });
    } catch (error) { setState({ loading: false, error: getApiError(error) }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const accept = async (likeId) => {
    try {
      const result = await likesService.accept(likeId);
      setLikes((items) => items.filter((item) => String(item.likeId) !== String(likeId)));
      setMatch(result.match);
    } catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); }
  };
  const pass = async (likeId) => {
    try {
      await likesService.pass(likeId);
      setLikes((items) => items.filter((item) => String(item.likeId) !== String(likeId)));
    } catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); }
  };

  return <section className="mx-auto min-h-screen max-w-6xl px-4 pb-14 pt-24">
    <MatchModal match={match} onClose={() => setMatch(null)} />
    <p className="text-sm font-bold uppercase tracking-wider text-pink-300">Your likes</p>
    <h1 className="mt-2 text-5xl">Likes</h1>
    <div className="mt-6 flex gap-2">
      <button onClick={() => setTab('sent')} className={`rounded-full px-5 py-2.5 font-semibold ${tab === 'sent' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white/5 text-white/55'}`}>You liked ({sentLikes.length})</button>
      <button onClick={() => setTab('received')} className={`rounded-full px-5 py-2.5 font-semibold ${tab === 'received' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white/5 text-white/55'}`}>Liked you ({likes.length})</button>
    </div>
    <p className="mt-3 text-white/45">{tab === 'sent' ? 'People you liked appear here while you wait for a spark.' : 'Accept a spark to create a match, or pass privately.'}</p>
    <div className="mt-6"><Alert>{state.error}</Alert></div>
    {state.loading && <LoaderCircle className="mx-auto mt-20 animate-spin text-pink-300" />}
    {!state.loading && tab === 'sent' && !sentLikes.length && <div className="glass mt-10 rounded-3xl p-12 text-center"><Heart className="mx-auto text-pink-400" size={44} /><h2 className="mt-4 text-2xl">You haven't liked anyone yet</h2><p className="mt-2 text-white/40">Likes you send from Discover will appear here.</p></div>}
    {!state.loading && tab === 'received' && !likes.length && <div className="glass mt-10 rounded-3xl p-12 text-center"><Heart className="mx-auto text-pink-400" size={44} /><h2 className="mt-4 text-2xl">No new likes right now</h2><p className="mt-2 text-white/40">New incoming likes will appear here.</p></div>}
    {tab === 'sent' && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sentLikes.map(({ likeId, profile, status }) => <article key={likeId} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.04]">
        <div className="aspect-[4/3] bg-purple-950">{profile.photo ? <img src={profile.photo.imageUrl} alt={profile.firstName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Heart className="text-pink-300" /></div>}</div>
        <div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-2xl">{profile.firstName}, {ageFromDob(profile.dob)}</h2><span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-semibold text-pink-200">{status === 'accepted' ? 'Matched' : 'Like sent'}</span></div><p className="mt-2 flex items-center gap-1 text-sm text-white/45"><MapPin size={14} /> {profile.city}</p><div className="mt-4 flex flex-wrap gap-2">{profile.interests?.map((interest) => <span key={interest} className="rounded-full bg-pink-400/10 px-2.5 py-1 text-xs text-pink-200">{interest}</span>)}</div></div>
      </article>)}
    </div>}
    {tab === 'received' && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {likes.map(({ likeId, profile }) => <article key={likeId} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.04]">
        <div className="aspect-[4/3] bg-purple-950">{profile.photo ? <img src={profile.photo.imageUrl} alt={profile.firstName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Heart className="text-pink-300" /></div>}</div>
        <div className="p-5"><h2 className="text-2xl">{profile.firstName}, {ageFromDob(profile.dob)}</h2><p className="mt-2 flex items-center gap-1 text-sm text-white/45"><MapPin size={14} /> {profile.city}</p><div className="mt-4 flex flex-wrap gap-2">{profile.interests?.map((interest) => <span key={interest} className="rounded-full bg-pink-400/10 px-2.5 py-1 text-xs text-pink-200">{interest}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => pass(likeId)} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-white/55 hover:bg-white/5"><X size={18} /> Pass</button><button onClick={() => accept(likeId)} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-semibold"><Check size={18} /> Accept</button></div></div>
      </article>)}
    </div>}
  </section>;
}
