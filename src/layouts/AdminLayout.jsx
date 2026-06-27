import { Flag, Gauge, LogOut, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const link = 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/55 hover:bg-white/5 hover:text-white';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0d0813] text-white lg:flex">
      <aside className="border-b border-white/10 bg-[#160d1e] p-4 lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
        <h1 className="text-2xl">CyberNest <span className="text-sm text-pink-300">Admin</span></h1>
        <nav className="mt-7 grid grid-cols-2 gap-1 lg:grid-cols-1">
          <NavLink className={link} to="/admin/dashboard"><Gauge size={18} /> Dashboard</NavLink>
          <NavLink className={link} to="/admin/users"><Users size={18} /> Users</NavLink>
          <NavLink className={link} to="/admin/reports"><Flag size={18} /> Reports</NavLink>
          <NavLink className={link} to="/admin/verifications"><ShieldCheck size={18} /> Verifications</NavLink>
        </nav>
        <button onClick={() => { logout(); navigate('/admin/login'); }} className={`${link} mt-4 w-full`}><LogOut size={18} /> Log out</button>
      </aside>
      <main className="flex-1 p-5 lg:ml-64 lg:p-10"><Outlet /></main>
    </div>
  );
}
