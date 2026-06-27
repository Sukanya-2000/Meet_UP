import { Heart, LoaderCircle, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import matchService from '../services/matchService';
import { getSocket } from '../services/socket';
import { getApiError } from '../utils/apiError';

const formatTime = (date) => date
  ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(date))
  : '';

export default function ConnectionsPage() {
  const [matches, setMatches] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [state, setState] = useState({ loading: true, error: '' });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await matchService.getMatches();
      setMatches(data.matches);
      setState({ loading: false, error: '' });
    } catch (error) { setState({ loading: false, error: getApiError(error) }); }
  }, []);

  useEffect(() => {
    load();
    const socket = getSocket();
    const presenceList = (ids) => setOnlineUsers(new Set(ids.map(String)));
    const presenceUpdate = ({ userId, online }) => setOnlineUsers((current) => {
      const next = new Set(current);
      if (online) next.add(String(userId)); else next.delete(String(userId));
      return next;
    });
    const newMessage = () => load();
    socket.on('presence:list', presenceList);
    socket.on('presence:update', presenceUpdate);
    socket.on('message:new', newMessage);
    return () => {
      socket.off('presence:list', presenceList);
      socket.off('presence:update', presenceUpdate);
      socket.off('message:new', newMessage);
    };
  }, [load]);

  return (
    <section className="mx-auto min-h-screen max-w-4xl px-4 pb-12 pt-24">
      <p className="text-sm font-semibold uppercase tracking-wider text-pink-300">Your people</p>
      <h1 className="mt-2 text-4xl">Matches</h1>
      <p className="mt-2 text-white/50">Mutual sparks and conversations, all in one place.</p>
      <div className="mt-6"><Alert>{state.error}</Alert></div>
      {state.loading && <LoaderCircle className="mx-auto mt-20 animate-spin text-pink-300" />}
      {!state.loading && !matches.length && <div className="glass mt-10 rounded-3xl p-12 text-center"><Heart className="mx-auto text-pink-400" size={42} /><h2 className="mt-4 text-2xl">No matches yet</h2><p className="mt-2 text-white/45">When someone likes you back, they will appear here.</p></div>}
      <div className="mt-8 space-y-3">
        {matches.map((match) => {
          const online = onlineUsers.has(String(match.otherUserId));
          return (
            <button key={match._id} onClick={() => navigate(`/chat/${match.conversation?._id || match._id}`)} className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4 text-left transition hover:border-pink-400/25 hover:bg-white/[.07]">
              <div className="relative">
                {match.photo ? <img src={match.photo.imageUrl} alt={match.profile?.firstName} className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />}
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#1b1024] ${online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3"><h2 className="truncate font-semibold">{match.profile?.firstName || 'CyberNest member'}</h2><span className="text-xs text-white/30">{formatTime(match.lastMessage?.createdAt || match.matchedAt)}</span></div>
                <p className="mt-1 truncate text-sm text-white/45">{match.lastMessage?.text || match.lastMessage?.message || `You matched! Say hello to ${match.profile?.firstName || 'them'}.`}</p>
                <p className={`mt-1 text-xs ${online ? 'text-emerald-300' : 'text-white/25'}`}>{online ? 'Online now' : 'Offline'}</p>
              </div>
              {match.unreadCount > 0 ? <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-pink-500 px-2 text-xs font-bold">{match.unreadCount}</span> : <MessageCircle size={19} className="text-white/20" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
