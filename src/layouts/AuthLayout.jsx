import { Link, Outlet } from 'react-router-dom';
import CyberNestLogo from '../components/CyberNestLogo';

export default function AuthLayout() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-coral-300/25 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="relative w-full max-w-lg">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-bold"><CyberNestLogo showText /></Link>
        <div className="glass rounded-3xl p-6 sm:p-9">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
