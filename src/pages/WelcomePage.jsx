import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import CyberNestLogo from '../components/CyberNestLogo';

export default function WelcomePage() {
  return (
    <main className="min-h-screen overflow-hidden text-slate-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold"><CyberNestLogo showText /></Link>
        <Link to="/login" className="rounded-2xl border border-coral-100 bg-white px-5 py-2.5 text-sm font-semibold text-coral-500 shadow-soft transition hover:bg-coral-50">Log in</Link>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-2 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-coral-100 bg-white/80 px-4 py-2 text-sm font-semibold text-coral-500 shadow-soft">
            <Sparkles size={16} /> Connect. Share. Belong.
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
            Find your person.<br /><span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Feel at home.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
            CyberNest is a warm, intentional space for genuine connections—built around trust, kindness, and the courage to be yourself.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary w-auto px-7">Create your account <ArrowRight size={18} /></Link>
            <a href="#values" className="btn-secondary text-center">Why CyberNest?</a>
          </div>
          <p className="mt-4 text-sm text-slate-400">18+ only · Free to join · Your privacy matters</p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 rotate-6 rounded-[2.5rem] bg-gradient-to-br from-coral-200 to-orange-100 blur-sm" />
          <div className="glass relative rounded-[2.5rem] p-8 sm:p-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center"><CyberNestLogo className="h-24 w-24" /></div>
            <h2 className="mt-7 text-center text-3xl">A softer kind of spark</h2>
            <p className="mt-3 text-center leading-7 text-slate-500">Thoughtful profiles. Respectful people. Connections that have room to become something real.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-coral-50 p-4"><ShieldCheck className="text-coral-500" /><p className="mt-2 text-sm font-semibold">Safety first</p></div>
              <div className="rounded-2xl bg-orange-50 p-4"><LockKeyhole className="text-orange-500" /><p className="mt-2 text-sm font-semibold">Privacy built in</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="values" className="border-t border-coral-100 bg-white/45">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 text-center sm:grid-cols-3">
          {[
            ['Be genuine', 'Show up as yourself, without the performance.'],
            ['Move with intention', 'Make space for conversations that matter.'],
            ['Feel protected', 'Your trust is the foundation of our community.'],
          ].map(([title, copy]) => <div key={title}><h3 className="font-semibold text-coral-500">{title}</h3><p className="mt-2 text-sm text-slate-500">{copy}</p></div>)}
        </div>
      </section>
    </main>
  );
}
