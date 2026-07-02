import { useCallback, useEffect, useState } from 'react';
import { campusInstitutionSearch, campusJoin, campusOverview, curated, disconnectMusic, eventAction, events, musicProfile, spotifyStart } from '../services/platformService';
import { getApiError } from '../utils/apiError';

export default function CommunityPage() {
  const [collections, setCollections] = useState({});
  const [eventList, setEvents] = useState([]);
  const [campus, setCampus] = useState({ institutions: [], membership: null });
  const [music, setMusic] = useState(null);
  const [institutionResults, setInstitutionResults] = useState([]);
  const [form, setForm] = useState({ institutionId: '', customInstitutionName: '', email: '', graduationYear: new Date().getFullYear() + 1 });
  const [message, setMessage] = useState(new URLSearchParams(location.search).get('spotify') === 'connected' ? 'Spotify connected successfully.' : '');

  const load = useCallback(async () => {
    try {
      const [picks, eventData, campusData, musicData] = await Promise.all([curated(), events(), campusOverview(), musicProfile()]);
      setCollections(picks.collections || {});
      setEvents(eventData.events || []);
      setCampus(campusData);
      setMusic(musicData.music || null);
    } catch (error) { setMessage(getApiError(error)); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    campusInstitutionSearch('').then((data) => setInstitutionResults(data.institutions || [])).catch(() => setInstitutionResults([]));
  }, []);

  const connectSpotify = async () => { try { location.href = (await spotifyStart()).url; } catch (error) { setMessage(getApiError(error)); } };
  const submitCampus = async (event) => { event.preventDefault(); try { await campusJoin(form); setMessage('Campus verification submitted.'); await load(); } catch (error) { setMessage(getApiError(error)); } };
  const institutionValue = (item) => `${item._id || 'world'}|${item.domain || ''}|${item.name}`;
  const selectInstitution = (event) => {
    const value = event.target.value;
    const item = institutionResults.find((institution) => institutionValue(institution) === value);
    setForm({ ...form, institutionId: item?._id || value, customInstitutionName: item && !item._id ? item.name : '' });
  };

  return <section className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-24 text-slate-800">
    <h1 className="text-4xl font-bold">Community</h1><p className="mt-2 text-slate-500">Curated picks, nearby events, music and verified campus connections.</p>
    {message && <p className="mt-4 rounded-xl bg-coral-50 p-3">{message}</p>}
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <article className="card p-5"><h2 className="text-2xl font-bold">Spotify</h2><p className="mt-2 text-slate-500">{music ? `${music.topArtists?.length || 0} top artists synced` : 'Connect listening taste to Music Mode.'}</p><button className="btn-primary mt-4" onClick={music ? async()=>{await disconnectMusic();await load();} : connectSpotify}>{music ? 'Disconnect Spotify' : 'Connect Spotify'}</button></article>
      <article className="card p-5">
        <h2 className="text-2xl font-bold">Campus Mode</h2>
        {campus.membership ? <p className="mt-3">{campus.membership.institutionId?.name} · <strong className="capitalize">{campus.membership.status}</strong></p> : <form className="mt-3 grid gap-3" onSubmit={submitCampus}>
          <select className="input" required value={form.institutionId === 'other' ? 'other' : institutionResults.find((item) => item._id === form.institutionId) ? institutionValue(institutionResults.find((item) => item._id === form.institutionId)) : form.institutionId} onChange={selectInstitution}>
            <option value="">Choose institution</option>
            {institutionResults.map((item) => <option key={institutionValue(item)} value={institutionValue(item)}>{item.name}{item.country ? ` — ${item.country}` : ''}</option>)}
            <option value="other">Other</option>
          </select>
          {form.institutionId === 'other' && <input className="input" required placeholder="Enter institution name" value={form.customInstitutionName} onChange={(e)=>setForm({...form,customInstitutionName:e.target.value})}/>} 
          <input className="input" required type="email" placeholder="Institution email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/>
          <input className="input" required type="number" min="2000" max="2100" value={form.graduationYear} onChange={(e)=>setForm({...form,graduationYear:Number(e.target.value)})}/>
          <button className="btn-primary" type="submit">Submit verification</button>
        </form>}
      </article>
    </div>
    <h2 className="mt-10 text-3xl font-bold">Events</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{eventList.length ? eventList.map((item)=><article key={item._id} className="card p-5"><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-2 text-slate-500">{item.venue} · {new Date(item.startsAt).toLocaleString()}</p><button className="mt-3 text-coral-500" onClick={async()=>{await eventAction(item._id,'going');await load();}}>RSVP going</button></article>) : <p className="text-slate-500">No upcoming events.</p>}</div>
    {Object.entries(collections).map(([name,profiles])=><div key={name}><h2 className="mt-10 text-3xl font-bold capitalize">{name.replace(/([A-Z])/g,' $1')}</h2><div className="mt-4 flex gap-3 overflow-x-auto">{profiles.map((profile)=><article key={profile._id} className="card min-w-52 p-4"><p className="font-semibold">{profile.firstName}</p><p className="text-sm text-slate-500">{profile.recommendation?.reasons?.join(' · ')}</p></article>)}</div></div>)}
  </section>;
}
