import { MoreHorizontal, ShieldAlert, UserX, X } from 'lucide-react';
import { useState } from 'react';
import safetyService from '../services/safetyService';
import { getApiError } from '../utils/apiError';
import Alert from './Alert';

const reasons = [
  ['fake-profile', 'Fake profile'],
  ['harassment', 'Harassment'],
  ['spam', 'Spam or scam'],
  ['inappropriate-content', 'Inappropriate content'],
  ['other', 'Other'],
];

export default function SafetyActions({ userId, onBlocked, compact = false }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('harassment');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const submitReport = async (alsoBlock) => {
    try {
      await safetyService.report({ reportedUserId: String(userId), reason, details, block: alsoBlock });
      setOpen(false);
      if (alsoBlock) onBlocked?.();
    } catch (requestError) { setError(getApiError(requestError)); }
  };
  const block = async () => {
    try { await safetyService.block(String(userId), reason); setOpen(false); onBlocked?.(); }
    catch (requestError) { setError(getApiError(requestError)); }
  };

  return <>
    <button type="button" onClick={(event) => { event.stopPropagation(); setOpen(true); }} className={compact ? 'rounded-full p-2 text-slate-500 hover:bg-coral-50' : 'rounded-full border border-coral-100 bg-white/90 p-2.5 text-slate-600 shadow-soft'} title="Safety options"><MoreHorizontal size={19} /></button>
    {open && (
      <div onClick={(event) => event.stopPropagation()} className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
        <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-coral-100 bg-white p-6 text-slate-900 shadow-2xl">
          <button onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
          <ShieldAlert className="text-rose-500" />
          <h2 className="mt-3 text-3xl">Safety options</h2>
          <p className="mt-2 text-sm text-slate-600">Reports are reviewed by the CyberNest moderation team.</p>
          <div className="mt-5"><Alert>{error}</Alert></div>
          <label className="label mt-4">Reason</label>
          <select value={reason} onChange={(event) => setReason(event.target.value)} className="input mt-2">
            {reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="label mt-4">Details</label>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} className="input mt-2 min-h-28" maxLength={1000} placeholder="Add context for moderators..." />
          <button onClick={() => submitReport(false)} className="btn-primary mt-5"><ShieldAlert size={17} /> Submit report</button>
          <button onClick={() => submitReport(true)} className="mt-3 w-full rounded-2xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-700 hover:bg-rose-200">Report and block</button>
          <button onClick={block} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><UserX size={16} /> Block without reporting</button>
        </div>
      </div>
    )}
  </>;
}
