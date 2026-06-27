import { Compass, Crown, Heart, LogOut, MessageCircle, Settings, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import CyberNestLogo from '../components/CyberNestLogo';
import useAuth from '../hooks/useAuth';
import { disconnectSocket } from '../services/socket';

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { disconnectSocket(); logout(); navigate('/'); };

  return (
    <main className="min-h-screen bg-warm-app">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-coral-100 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button onClick={() => navigate('/discover')} className="flex items-center gap-2 text-lg font-bold"><CyberNestLogo showText /></button>
          <nav className="flex items-center gap-1">
            <NavLink to="/discover" className="rounded-2xl bg-coral-100 p-2.5 text-coral-500" title="Discover"><Compass size={20} /></NavLink>
            <NavLink to="/requests" className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-coral-500" title="Requests"><UsersRound size={20} /></NavLink>
            <NavLink to="/connections" className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-coral-500" title="Matches"><MessageCircle size={20} /></NavLink>
            <NavLink to="/liked-you" className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-coral-500" title="Likes"><Heart size={20} /></NavLink>
            <NavLink to="/premium" className="rounded-2xl p-2.5 text-amber-500 hover:bg-amber-50" title="Premium"><Crown size={20} /></NavLink>
            <NavLink to="/safety" className="rounded-2xl p-2.5 text-emerald-500 hover:bg-emerald-50" title="Safety Center"><ShieldCheck size={20} /></NavLink>
            <NavLink to="/profile/edit" className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-coral-500" title="Profile"><UserRound size={20} /></NavLink>
            <NavLink to="/settings" className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-coral-500" title="Settings"><Settings size={20} /></NavLink>
            <button onClick={signOut} className="rounded-2xl p-2.5 text-slate-400 hover:bg-coral-50 hover:text-slate-600" title="Log out"><LogOut size={20} /></button>
          </nav>
        </div>
      </header>
      <Outlet />
    </main>
  );
}
