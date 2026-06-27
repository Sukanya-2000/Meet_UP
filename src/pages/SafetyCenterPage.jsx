import { Check, HeartPulse, PhoneCall, ShieldCheck, TriangleAlert, UserX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import matchService from '../services/matchService';
import safetyService from '../services/safetyService';
import { getApiError } from '../utils/apiError';

export default function SafetyCenterPage() {
  const [checkIns, setCheckIns] = useState([]);
  const [matches, setMatches] = useState([]);
  const [trust, setTrust] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ matchId: '', scheduledFor: '', venue: '', trustedContactName: '', trustedContactPhone: '' });
  const load = useCallback(async () => {
    try {
      const [checks, matchData, trustData] = await Promise.all([safetyService.getCheckIns(), matchService.getMatches(), safetyService.getTrust()]);
      setCheckIns(checks.checkIns);
      setMatches(matchData.matches);
      setTrust(trustData.trust);
    } catch (requestError) { setError(getApiError(requestError)); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const create = async (event) => {
    event.preventDefault();
    try { await safetyService.createCheckIn(form); setForm({ matchId: '', scheduledFor: '', venue: '', trustedContactName: '', trustedContactPhone: '' }); await load(); }
    catch (requestError) { setError(getApiError(requestError)); }
  };
  const update = async (id, status) => {
    try { await safetyService.updateCheckIn(id, status); await load(); }
    catch (requestError) { setError(getApiError(requestError)); }
  };

  return <section className="mx-auto min-h-screen max-w-5xl px-4 pb-14 pt-24"><p className="text-sm font-bold uppercase tracking-wider text-emerald-300">Trust & Safety</p><h1 className="mt-2 text-5xl">Safety Center</h1><p className="mt-3 max-w-2xl text-white/50">Practical controls for safer conversations and in-person plans. If you are in immediate danger, contact local emergency services.</p><div className="mt-6"><Alert>{error}</Alert></div>
    <div className="mt-8 grid gap-5 md:grid-cols-3"><div className="glass rounded-2xl p-5 md:col-span-1"><ShieldCheck className="text-emerald-300" /><h2 className="mt-3 text-2xl">Trust profile</h2><p className="mt-3 text-5xl font-bold text-pink-300">{trust?.score ?? '—'}</p><p className="mt-2 text-sm text-white/45">Based on explainable account, profile, photo, verification and standing signals.</p><div className="mt-4 space-y-2 text-sm">{trust && Object.entries(trust.signals).map(([name, active]) => <p key={name} className={active ? 'text-emerald-300' : 'text-white/35'}>{active ? '✓' : '○'} {name.replace(/([A-Z])/g, ' $1')}</p>)}</div></div><div className="glass rounded-2xl p-5 md:col-span-2"><HeartPulse className="text-pink-300" /><h2 className="mt-3 text-2xl">Before meeting</h2><ul className="mt-4 space-y-3 text-sm text-white/55"><li>Meet in a public place and arrange your own transport.</li><li>Keep exact home/work addresses private until trust is established.</li><li>Tell someone you trust where you are going.</li><li>Never send money or financial credentials.</li><li>Use Nest Check-In below to create a safety reminder.</li></ul></div></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><form onSubmit={create} className="glass rounded-3xl p-6"><h2 className="text-3xl">Schedule Nest Check-In</h2><label className="label mt-5">Match (optional)<select className="input mt-2" value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })}><option value="" className="bg-nest-950">General check-in</option>{matches.map((match) => <option className="bg-nest-950" key={match._id} value={match._id}>{match.profile?.firstName}</option>)}</select></label><label className="label mt-4">Check-in time<input required type="datetime-local" className="input mt-2" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} /></label><label className="label mt-4">Public venue<input required className="input mt-2" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label><div className="mt-4 grid grid-cols-2 gap-3"><input className="input" placeholder="Trusted contact name" value={form.trustedContactName} onChange={(e) => setForm({ ...form, trustedContactName: e.target.value })} /><input className="input" placeholder="Phone (stored only)" value={form.trustedContactPhone} onChange={(e) => setForm({ ...form, trustedContactPhone: e.target.value })} /></div><button className="btn-primary mt-5">Schedule check-in</button></form><div><h2 className="text-3xl">Your check-ins</h2><div className="mt-4 space-y-3">{checkIns.length ? checkIns.map((item) => <div key={item._id} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{item.venue}</h3><p className="mt-1 text-xs text-white/40">{new Date(item.scheduledFor).toLocaleString()}</p></div><span className={`text-sm capitalize ${item.status === 'safe' ? 'text-emerald-300' : item.status === 'needs-help' || item.status === 'overdue' ? 'text-rose-300' : 'text-amber-300'}`}>{item.status}</span></div>{['scheduled', 'overdue'].includes(item.status) && <div className="mt-4 flex gap-2"><button onClick={() => update(item._id, 'safe')} className="flex items-center gap-1 rounded-lg bg-emerald-400/15 px-3 py-2 text-xs text-emerald-300"><Check size={14} /> I’m safe</button><button onClick={() => update(item._id, 'needs-help')} className="flex items-center gap-1 rounded-lg bg-rose-400/15 px-3 py-2 text-xs text-rose-300"><TriangleAlert size={14} /> Need help</button></div>}</div>) : <p className="rounded-2xl bg-white/[.03] p-6 text-sm text-white/35">No check-ins scheduled.</p>}</div></div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-white/[.04] p-5"><PhoneCall className="text-rose-300" /><h3 className="mt-3 font-semibold">Emergency help</h3><p className="mt-2 text-sm text-white/45">Contact your local emergency number when danger is immediate.</p></div><div className="rounded-2xl bg-white/[.04] p-5"><UserX className="text-amber-300" /><h3 className="mt-3 font-semibold">Block freely</h3><p className="mt-2 text-sm text-white/45">Blocking is private and removes discovery and chat access.</p></div><div className="rounded-2xl bg-white/[.04] p-5"><ShieldCheck className="text-emerald-300" /><h3 className="mt-3 font-semibold">Report concerns</h3><p className="mt-2 text-sm text-white/45">Use the safety menu on profiles and chats to reach moderators.</p></div></div></section>;
}
