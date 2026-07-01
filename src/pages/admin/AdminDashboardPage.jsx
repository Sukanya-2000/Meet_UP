import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { analytics, ops } from '../../services/platformService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [platform, setPlatform] = useState({}); const [health, setHealth] = useState({});
  useEffect(() => { adminService.dashboard().then((data) => setStats(data.stats)); }, []);
  useEffect(() => { analytics().then((data) => setPlatform(data.metrics || {})); ops().then(setHealth); }, []);
  return <><h1 className="text-4xl">Dashboard</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Object.entries({...stats,...platform}).map(([name, value]) => <div key={name} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-sm capitalize text-white/45">{name.replace(/([A-Z])/g, ' $1')}</p><p className="mt-2 text-3xl font-bold text-pink-300">{value}</p></div>)}</div><div className="mt-8 rounded-2xl border border-white/10 p-5"><h2 className="text-2xl">System health</h2><pre className="mt-3 overflow-auto text-xs text-white/60">{JSON.stringify(health,null,2)}</pre><a href="/api/platform/admin/analytics/export" className="mt-4 inline-block text-pink-300">Export analytics CSV</a></div></>;
}
