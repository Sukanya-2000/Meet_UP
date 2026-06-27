import { Check, Clock3, HeartHandshake, LoaderCircle, MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import connectionService from '../services/connectionService';
import { getApiError } from '../utils/apiError';

const Person = ({ item, received, onRespond, onChat }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-coral-100 bg-white/95 p-4 shadow-soft">
    {item.photo ? <img src={item.photo.imageUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-coral-gradient" />}
    <div className="min-w-0 flex-1">
      <h3 className="truncate font-semibold text-slate-900">{item.profile?.firstName || 'CyberNest member'}</h3>
      <p className="mt-1 text-sm text-slate-600">{item.profile?.city || ''}</p>
      {!received && <p className="mt-1 text-xs font-bold capitalize text-rose-600">{item.status}</p>}
    </div>
    {item.status === 'accepted' && item.conversationId && <button onClick={() => onChat(item.conversationId)} className="flex items-center gap-2 rounded-full bg-coral-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft" title="Chat"><MessageCircle size={17} /> Chat</button>}
    {received && <div className="flex gap-2">
      <button onClick={() => onRespond(item._id, 'accepted')} className="rounded-full bg-emerald-500 p-3 text-white hover:bg-emerald-600" title="Accept"><Check size={18} /></button>
      <button onClick={() => onRespond(item._id, 'declined')} className="rounded-full bg-rose-500 p-3 text-white hover:bg-rose-600" title="Decline"><X size={18} /></button>
    </div>}
  </div>
);

export default function RequestsPage() {
  const [data, setData] = useState({ received: [], sent: [] });
  const [state, setState] = useState({ loading: true, error: '' });
  const navigate = useNavigate();
  const load = useCallback(async () => {
    try {
      const result = await connectionService.list();
      setData(result);
      setState({ loading: false, error: '' });
    } catch (error) { setState({ loading: false, error: getApiError(error) }); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const respond = async (id, status) => {
    try {
      const response = await connectionService.respond(id, status);
      await load();
      if (status === 'accepted' && response.conversationId) navigate(`/chat/${response.conversationId}`);
      else if (status === 'accepted' && response.matchId) navigate('/matches');
    } catch (error) { setState({ loading: false, error: getApiError(error) }); }
  };

  return (
    <section className="mx-auto min-h-screen max-w-3xl px-4 pb-12 pt-24 text-slate-900">
      <p className="text-sm font-bold uppercase tracking-wider text-coral-500">Connections</p>
      <h1 className="mt-2 text-4xl">Requests</h1>
      <p className="mt-2 text-slate-600">People who want to get to know you—and requests you have sent.</p>
      <div className="mt-6"><Alert>{state.error}</Alert></div>
      {state.loading && <LoaderCircle className="mx-auto mt-16 animate-spin text-coral-500" />}
      {!state.loading && <>
        <h2 className="mt-8 flex items-center gap-2 text-xl"><HeartHandshake className="text-rose-500" /> Received</h2>
        <div className="mt-4 space-y-3">{data.received.length ? data.received.map((item) => <Person key={item._id} item={item} received onRespond={respond} onChat={(conversationId) => navigate(`/chat/${conversationId}`)} />) : <p className="rounded-2xl border border-coral-100 bg-white/95 p-6 text-center text-sm font-medium text-slate-600 shadow-soft">No pending requests yet.</p>}</div>
        <h2 className="mt-9 flex items-center gap-2 text-xl"><Clock3 className="text-purple-500" /> Sent</h2>
        <div className="mt-4 space-y-3">{data.sent.length ? data.sent.map((item) => <Person key={item._id} item={item} onChat={(conversationId) => navigate(`/chat/${conversationId}`)} />) : <p className="rounded-2xl border border-coral-100 bg-white/95 p-6 text-center text-sm font-medium text-slate-600 shadow-soft">You have not sent any requests.</p>}</div>
      </>}
    </section>
  );
}
