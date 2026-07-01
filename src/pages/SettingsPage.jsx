import { Bell, Lock, Moon, Shield, Sun, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/notificationService';
import { createOpeningMove, deleteOpeningMove, openingMoves, setSnooze } from '../services/interactionService';
import { getAppearance, updateAppearance } from '../services/settingsService';

const modes = ['system', 'light', 'dark'];
const appearanceDefaults = { theme: 'system', accentColor: 'coral', fontSize: 'medium', textScale: 1, reducedMotion: false, highContrast: false, rtlPreview: false };
const storedAppearance = (() => { try { return { ...appearanceDefaults, ...JSON.parse(localStorage.getItem('cybernest_appearance')) }; } catch { return appearanceDefaults; } })();
function applyAppearance(value) {
  const root = document.documentElement;
  root.dataset.themeMode = value.theme;
  root.dataset.accent = value.accentColor;
  root.dataset.contrast = value.highContrast ? 'high' : 'normal';
  root.dataset.reducedMotion = String(value.reducedMotion);
  root.dir = value.rtlPreview ? 'rtl' : 'ltr';
  root.style.fontSize = `${(value.fontSize === 'small' ? 15 : value.fontSize === 'large' ? 18 : 16) * value.textScale}px`;
}

export default function SettingsPage() {
  const [appearance, setAppearance] = useState(storedAppearance);
  const [appearanceStatus, setAppearanceStatus] = useState('');
  const [privacy, setPrivacy] = useState({
    verifiedOnly: localStorage.getItem('cybernest_privacy_verified') === 'true',
    onlineStatus: localStorage.getItem('cybernest_privacy_online') !== 'false',
    readReceipts: localStorage.getItem('cybernest_privacy_receipts') !== 'false',
  });
  const [notifications, setNotifications] = useState({ push: true, email: true, inApp: true, matches: true, messages: true, likes: true, safety: true, marketing: false });
  const [notificationStatus, setNotificationStatus] = useState('');
  const [moves, setMoves] = useState([]); const [moveText, setMoveText] = useState(''); const [snoozed, setSnoozed] = useState(false);
  useEffect(() => { getNotificationPreferences().then((data) => setNotifications((value) => ({ ...value, ...data.preferences }))).catch(() => setNotificationStatus('Could not load notification preferences.')); }, []);
  useEffect(() => { openingMoves().then((data) => setMoves(data.openingMoves || [])).catch(() => {}); }, []);
  const toggleNotification = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] }; setNotifications(next); setNotificationStatus('Saving…');
    try { await updateNotificationPreferences({ [key]: next[key] }); setNotificationStatus('Saved'); } catch { setNotifications(notifications); setNotificationStatus('Could not save.'); }
  };

  useEffect(() => {
    applyAppearance(storedAppearance);
    getAppearance().then(({ appearance: remote }) => {
      const next = { ...appearanceDefaults, ...remote };
      setAppearance(next); applyAppearance(next); localStorage.setItem('cybernest_appearance', JSON.stringify(next));
    }).catch(() => setAppearanceStatus('Using settings saved on this device.'));
  }, []);
  const saveAppearance = async (changes) => {
    const next = { ...appearance, ...changes };
    setAppearance(next); applyAppearance(next); localStorage.setItem('cybernest_appearance', JSON.stringify(next)); setAppearanceStatus('Saving…');
    try { await updateAppearance(next); setAppearanceStatus('Saved'); } catch { setAppearanceStatus('Saved on this device; cloud sync unavailable.'); }
  };

  const togglePrivacy = (key) => {
    setPrivacy((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(`cybernest_privacy_${key === 'verifiedOnly' ? 'verified' : key === 'onlineStatus' ? 'online' : 'receipts'}`, String(next[key]));
      return next;
    });
  };

  return (
    <section className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-24 text-slate-800">
      <p className="text-sm font-bold uppercase tracking-wider text-coral-500">Settings</p>
      <h1 className="mt-2 text-5xl">Your CyberNest</h1>
      <p className="mt-2 text-slate-500">Control privacy, account preferences, and how the app feels.</p>

      <div className="mt-8 grid gap-5">
        <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft"><h2 className="text-2xl">Opening Moves</h2><p className="mt-2 text-sm text-slate-500">Give matches an easy question or prompt to answer.</p><div className="mt-4 space-y-2">{moves.map((move) => <div key={move._id} className="flex items-center justify-between rounded-xl bg-orange-50 p-3"><span>{move.content}</span><button onClick={async()=>{await deleteOpeningMove(move._id);setMoves((items)=>items.filter((item)=>item._id!==move._id));}} className="text-rose-500">Delete</button></div>)}</div>{moves.length<3&&<div className="mt-4 flex gap-2"><input className="input" value={moveText} onChange={(e)=>setMoveText(e.target.value)} maxLength={300} placeholder="Ask something inviting…"/><button className="btn-primary" onClick={async()=>{if(!moveText.trim())return;const data=await createOpeningMove({type:'question',content:moveText,orderIndex:moves.length});setMoves([...moves,data.openingMove]);setMoveText('');}}>Add</button></div>}<button className="btn-secondary mt-4 rounded-xl px-4 py-2" onClick={async()=>{await setSnooze({enabled:!snoozed,hours:24,reason:'Taking a break'});setSnoozed(!snoozed);}}>{snoozed?'Resume discovery':'Snooze for 24 hours'}</button></div>
        <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-2xl"><Sun className="text-coral-400" /> Appearance</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {modes.map((item) => (
              <button key={item} onClick={() => saveAppearance({ theme: item })} aria-pressed={appearance.theme === item} className={`rounded-2xl border px-5 py-4 text-left capitalize transition ${appearance.theme === item ? 'border-coral-300 bg-coral-50 text-coral-600' : 'border-slate-100 bg-white text-slate-500 hover:border-coral-200'}`}>
                <span className="flex items-center gap-2 font-semibold">{item === 'dark' ? <Moon size={18} /> : <Sun size={18} />} {item} mode</span>
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="label">Accent color<select className="input mt-2 capitalize" value={appearance.accentColor} onChange={(e) => saveAppearance({ accentColor: e.target.value })}>{['coral','rose','violet','blue','emerald','amber'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="label">Font size<select className="input mt-2 capitalize" value={appearance.fontSize} onChange={(e) => saveAppearance({ fontSize: e.target.value })}>{['small','medium','large'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="label sm:col-span-2">Text scaling: {Math.round(appearance.textScale * 100)}%<input className="mt-3 w-full accent-rose-500" type="range" min="0.8" max="1.5" step="0.1" value={appearance.textScale} onChange={(e) => saveAppearance({ textScale: Number(e.target.value) })} /></label>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['reducedMotion','Reduced motion'],['highContrast','High contrast'],['rtlPreview','RTL preview']].map(([key,label]) => <button key={key} onClick={() => saveAppearance({ [key]: !appearance[key] })} aria-pressed={appearance[key]} className="rounded-xl bg-orange-50 p-3">{label}: {appearance[key] ? 'On' : 'Off'}</button>)}</div>
          <p aria-live="polite" className="mt-3 text-sm text-slate-500">{appearanceStatus}</p>
        </div>

        <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-2xl"><Lock className="text-coral-400" /> Privacy</h2>
          <div className="mt-5 space-y-3">
            {[
              ['verifiedOnly', 'Verified-only browsing', 'Prioritize verified people in discovery.'],
              ['onlineStatus', 'Show online status', 'Let matches see when you are online.'],
              ['readReceipts', 'Read receipts', 'Show when you have read messages.'],
            ].map(([key, title, subtitle]) => (
              <button key={key} onClick={() => togglePrivacy(key)} className="flex w-full items-center justify-between rounded-2xl bg-orange-50/60 p-4 text-left">
                <span><span className="block font-semibold">{title}</span><span className="text-sm text-slate-500">{subtitle}</span></span>
                <span className={`h-7 w-12 rounded-full p-1 transition ${privacy[key] ? 'bg-coral-400' : 'bg-slate-200'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${privacy[key] ? 'translate-x-5' : ''}`} /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-2xl"><UserCog className="text-coral-400" /> Account</h2>
            <p className="mt-3 text-slate-500">Manage email, password, profile visibility, and account status from here in the next account phase.</p>
          </div>
          <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-2xl"><Shield className="text-coral-400" /> Safety</h2>
            <p className="mt-3 text-slate-500">Blocked profiles, reporting tools, and trust settings stay connected with the Safety Center.</p>
          </div>
          <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft sm:col-span-2">
            <h2 className="flex items-center gap-2 text-2xl"><Bell className="text-coral-400" /> Notifications</h2>
            <p className="mt-3 text-slate-500">Choose how CyberNest contacts you.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{['push','email','inApp','matches','messages','likes','safety','marketing'].map((key) => <button key={key} onClick={() => toggleNotification(key)} aria-pressed={notifications[key]} className="flex items-center justify-between rounded-xl bg-orange-50 p-3 text-left capitalize"><span>{key === 'inApp' ? 'In-app' : key}</span><span className={`h-6 w-11 rounded-full p-1 ${notifications[key] ? 'bg-coral-400' : 'bg-slate-200'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${notifications[key] ? 'translate-x-5' : ''}`} /></span></button>)}</div>
            <p aria-live="polite" className="mt-3 text-sm text-slate-500">{notificationStatus}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
