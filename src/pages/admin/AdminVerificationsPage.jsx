import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState([]);
  const load = () => adminService.verifications().then((data) => setRequests(data.requests));
  useEffect(() => { load(); }, []);
  const review = async (id, status) => { await adminService.reviewVerification(id, status); load(); };
  return <><h1 className="text-4xl">Verifications</h1><div className="mt-7 space-y-3">{requests.map((request) => <div key={request._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-5"><div><p>{request.userId?.email}</p><p className="mt-1 text-sm capitalize text-white/40">{request.status}</p></div>{request.status === 'pending' && <div className="space-x-3"><button onClick={() => review(request._id, 'approved')} className="text-emerald-300">Approve</button><button onClick={() => review(request._id, 'rejected')} className="text-rose-300">Reject</button></div>}</div>)}</div></>;
}
