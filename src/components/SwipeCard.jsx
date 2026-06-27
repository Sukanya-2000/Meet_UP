import { Camera, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import SafetyActions from './SafetyActions';

const ageFromDob = (dob) => {
  const born = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age;
};

export default function SwipeCard({ profile, motion, onConnect, requestState, onBlocked }) {
  const main = profile.photos?.find((photo) => photo.isMain) || profile.photos?.[0];
  return (
    <article className={`absolute inset-0 overflow-hidden rounded-[2rem] border border-coral-100 bg-white shadow-soft transition-all duration-300 ${motion === 'left' ? '-translate-x-[130%] -rotate-12 opacity-0' : motion === 'right' ? 'translate-x-[130%] rotate-12 opacity-0' : motion === 'up' ? '-translate-y-[130%] scale-105 opacity-0' : ''}`}>
      <div className="absolute right-4 top-4 z-20"><SafetyActions userId={profile.userId} onBlocked={onBlocked} /></div>
      <div className="relative h-[62%] overflow-hidden rounded-b-[2rem]">
        {main ? <img src={main.imageUrl} alt={profile.firstName} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-coral-100 to-orange-100 text-coral-300"><Camera size={52} /><p className="mt-3">No photo yet</p></div>}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-coral-500 shadow-soft"><Sparkles size={12} className="mr-1 inline" /> New here</div>
        <div className="absolute right-4 top-4 rounded-full bg-slate-900/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">1/6</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-slate-800">{profile.firstName}, {ageFromDob(profile.dob)}</h2>
              {profile.isVerified && <ShieldCheck size={18} className="text-coral-400" fill="currentColor" />}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} /> {profile.city} · 3 km away</p>
          </div>
          <button onClick={onConnect} disabled={requestState === 'sent'} className="rounded-full border border-coral-100 bg-white p-3 text-coral-500 shadow-soft transition hover:bg-coral-50 disabled:opacity-60">
            {requestState === 'sent' ? '✓' : '♡'}
          </button>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{profile.bio || 'Looking for real conversations and good vibes.'}</p>
        <p className="mt-2 text-xs text-coral-500">Trust score {profile.trustScore ?? 40}/100</p>
        {!!profile.interests?.length && <div className="mt-4 flex flex-wrap gap-2">{profile.interests.slice(0, 5).map((interest) => <span key={interest} className="rounded-full bg-coral-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{interest}</span>)}</div>}
      </div>
    </article>
  );
}
