import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({});
  useEffect(() => { adminService.dashboard().then((data) => setStats(data.stats)); }, []);
  return <><h1 className="text-4xl">Dashboard</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(stats).map(([name, value]) => <div key={name} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-sm capitalize text-white/45">{name.replace(/([A-Z])/g, ' $1')}</p><p className="mt-2 text-3xl font-bold text-pink-300">{value}</p></div>)}</div></>;
}
