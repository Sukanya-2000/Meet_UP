import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const load = () => adminService.users().then((data) => setUsers(data.users));
  useEffect(() => { load(); }, []);
  const status = async (id, accountStatus) => { await adminService.updateUserStatus(id, accountStatus); load(); };
  return <><h1 className="text-4xl">Users</h1><div className="mt-7 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/5 text-white/45"><tr><th className="p-4">User</th><th>Trust</th><th>Status</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user._id} className="border-t border-white/10"><td className="p-4"><p>{user.profile?.firstName || 'No profile'}</p><p className="text-xs text-white/35">{user.email}</p></td><td>{user.profile?.trustScore ?? '—'}</td><td className="capitalize">{user.accountStatus}</td><td>{user.role}</td><td className="space-x-2"><button onClick={() => status(user._id, 'suspended')} className="text-amber-300">Suspend</button><button onClick={() => status(user._id, 'banned')} className="text-rose-300">Ban</button><button onClick={() => status(user._id, 'active')} className="text-emerald-300">Activate</button><button onClick={() => adminService.managePremium(user._id, 'active')} className="text-purple-300">Premium</button></td></tr>)}</tbody></table></div></>;
}
