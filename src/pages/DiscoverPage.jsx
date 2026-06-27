import { Heart, LoaderCircle, RotateCcw, Rocket, SlidersHorizontal, Star, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import DiscoveryFilters from '../components/DiscoveryFilters';
import MatchModal from '../components/MatchModal';
import SwipeCard from '../components/SwipeCard';
import connectionService from '../services/connectionService';
import discoveryService from '../services/discoveryService';
import matchService from '../services/matchService';
import premiumService from '../services/premiumService';
import { getApiError } from '../utils/apiError';

const buttonStyle = 'flex h-14 w-14 items-center justify-center rounded-full border border-coral-100 bg-white shadow-soft transition hover:-translate-y-1 disabled:opacity-40 sm:h-16 sm:w-16';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', motion: '', page: 1, hasMore: false });
  const [sentRequests, setSentRequests] = useState([]);
  const [newMatch, setNewMatch] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ageMin: 18, ageMax: 60, gender: '', verifiedOnly: false });
  const current = profiles[0];

  const load = useCallback(async (page = 1, append = false) => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    try {
      const data = await discoveryService.getDiscovery(page, 10, filters);
      setProfiles((items) => append ? [...items, ...data.profiles] : data.profiles);
      setState({ loading: false, error: '', motion: '', page, hasMore: data.pagination.hasMore });
    } catch (error) {
      setState((value) => ({ ...value, loading: false, error: getApiError(error) }));
    }
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const act = async (action) => {
    if (!current || state.motion) return;
    const motion = action === 'pass' ? 'left' : action === 'favorite' ? 'up' : 'right';
    setState((value) => ({ ...value, motion }));
    try {
      const result = action === 'like'
        ? await matchService.like(current.userId)
        : await discoveryService.swipe(current.userId, action);
      if (result.matched && result.isNewMatch) setNewMatch(result.match);
      window.setTimeout(() => {
        setProfiles((items) => items.slice(1));
        setState((value) => ({ ...value, motion: '' }));
      }, 280);
    } catch (error) {
      setState((value) => ({ ...value, motion: '', error: getApiError(error) }));
    }
  };
  const rewind = async () => {
    try { await discoveryService.rewind(); await load(1); }
    catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); }
  };
  const connect = async (userId) => {
    try {
      await connectionService.send(userId);
      setSentRequests((items) => [...items, String(userId)]);
    } catch (error) {
      setState((value) => ({ ...value, error: getApiError(error) }));
    }
  };
  const boost = async () => {
    try { await premiumService.boost(); setState((value) => ({ ...value, error: '' })); }
    catch (error) { setState((value) => ({ ...value, error: getApiError(error) })); }
  };

  return (
    <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center px-4 pb-24 pt-24 text-slate-800">
      <MatchModal match={newMatch} onClose={() => setNewMatch(null)} />
      {showFilters && <DiscoveryFilters filters={filters} setFilters={setFilters} onApply={() => { setShowFilters(false); load(1); }} onClose={() => setShowFilters(false)} />}
      <div className="mb-4 flex w-full max-w-md items-center justify-between">
        <div><p className="text-sm font-bold uppercase tracking-wider text-coral-500">Discover</p><h1 className="text-4xl">Find your spark</h1></div>
        <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 rounded-full bg-coral-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft"><SlidersHorizontal size={16} /> Filters</button>
      </div>
      <div className="mb-3 w-full max-w-md"><Alert>{state.error}</Alert></div>
      <div className="relative mt-1 h-[min(68vh,650px)] w-full max-w-md">
        {profiles.slice(0, 2).reverse().map((profile, reverseIndex) => {
          const isCurrent = reverseIndex === profiles.slice(0, 2).length - 1;
          return <SwipeCard key={profile._id} profile={profile} motion={isCurrent ? state.motion : ''} onConnect={() => connect(profile.userId)} onBlocked={() => setProfiles((items) => items.filter((item) => String(item.userId) !== String(profile.userId)))} requestState={sentRequests.includes(String(profile.userId)) ? 'sent' : ''} />;
        })}
        {state.loading && !current && <div className="glass flex h-full items-center justify-center rounded-[2rem]"><LoaderCircle className="animate-spin text-coral-400" size={34} /></div>}
        {!state.loading && !current && <div className="glass flex h-full flex-col items-center justify-center rounded-[2rem] px-8 text-center"><Heart className="text-coral-400" size={48} /><h1 className="mt-5 text-3xl">You’re all caught up</h1><p className="mt-3 text-slate-500">Fresh people will appear here as the CyberNest community grows.</p>{state.hasMore && <button onClick={() => load(state.page + 1, true)} className="mt-6 text-sm font-semibold text-coral-500">Load more</button>}</div>}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
        <button onClick={rewind} className={`${buttonStyle} h-11 w-11 text-amber-400 sm:h-12 sm:w-12`} title="Rewind"><RotateCcw size={20} /></button>
        <button onClick={() => act('pass')} disabled={!current} className={`${buttonStyle} text-rose-400`} title="Pass"><X size={30} strokeWidth={2.5} /></button>
        <button onClick={() => act('like')} disabled={!current} className={`${buttonStyle} h-20 w-20 bg-coral-gradient text-white`} title="Like"><Heart size={34} fill="currentColor" /></button>
        <button onClick={() => act('favorite')} disabled={!current} className={`${buttonStyle} h-12 w-12 text-emerald-400 sm:h-14 sm:w-14`} title="Favorite"><Star size={24} fill="currentColor" /></button>
        <button onClick={boost} className={`${buttonStyle} h-11 w-11 text-purple-400 sm:h-12 sm:w-12`} title="Boost profile"><Rocket size={20} /></button>
      </div>
      <div className="mt-4 flex gap-5 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400"><span>Pass</span><span>Like</span><span>Favorite</span></div>
    </section>
  );
}
