import { Bell, Lock, Moon, Shield, Sun, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

const modes = ['system', 'light', 'dark'];

export default function SettingsPage() {
  const [mode, setMode] = useState(localStorage.getItem('cybernest_theme_mode') || 'system');
  const [privacy, setPrivacy] = useState({
    verifiedOnly: localStorage.getItem('cybernest_privacy_verified') === 'true',
    onlineStatus: localStorage.getItem('cybernest_privacy_online') !== 'false',
    readReceipts: localStorage.getItem('cybernest_privacy_receipts') !== 'false',
  });

  useEffect(() => {
    localStorage.setItem('cybernest_theme_mode', mode);
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.resolvedTheme = mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : mode === 'dark' ? 'dark' : 'light';
  }, [mode]);

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
        <div className="rounded-[2rem] border border-coral-100 bg-white/85 p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-2xl"><Sun className="text-coral-400" /> Appearance</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {modes.map((item) => (
              <button key={item} onClick={() => setMode(item)} className={`rounded-2xl border px-5 py-4 text-left capitalize transition ${mode === item ? 'border-coral-300 bg-coral-50 text-coral-600' : 'border-slate-100 bg-white text-slate-500 hover:border-coral-200'}`}>
                <span className="flex items-center gap-2 font-semibold">{item === 'dark' ? <Moon size={18} /> : <Sun size={18} />} {item} mode</span>
              </button>
            ))}
          </div>
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
            <p className="mt-3 text-slate-500">Notification preferences are ready for email/push integration.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
