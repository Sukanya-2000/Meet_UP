import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const load = () => adminService.reports().then((data) => setReports(data.reports));
  useEffect(() => { load(); }, []);
  const update = async (id, status) => { await adminService.updateReport(id, status); load(); };
  return <><h1 className="text-4xl">Reports</h1><div className="mt-7 space-y-3">{reports.map((report) => <div key={report._id} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex justify-between"><h2 className="font-semibold capitalize">{report.reason.replaceAll('-', ' ')}</h2><span className="text-sm capitalize text-pink-300">{report.status}</span></div><p className="mt-2 text-sm text-white/45">{report.reporterId?.email} reported {report.reportedUserId?.email}</p><p className="mt-2">{report.details}</p><div className="mt-4 space-x-3"><button onClick={() => update(report._id, 'reviewing')}>Review</button><button onClick={() => update(report._id, 'resolved')} className="text-emerald-300">Resolve</button><button onClick={() => update(report._id, 'dismissed')} className="text-white/40">Dismiss</button></div></div>)}</div></>;
}
