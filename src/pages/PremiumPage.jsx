import { Crown, Rocket, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';
import premiumService from '../services/premiumService';
import { getApiError } from '../utils/apiError';

const features = [[<Sparkles key="likes" />, 'Likes You'], [<Crown key="unlimited" />, 'Unlimited Likes'], [<ShieldCheck key="verified" />, 'Verified Only'], [<SlidersHorizontal key="filters" />, 'Advanced Filters'], [<Rocket key="boosts" />, 'Profile Boosts']];

export default function PremiumPage() {
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkingCheckout, setCheckingCheckout] = useState(false);
  const [selectedPlan] = useState('gold');
  const [now, setNow] = useState(Date.now());
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const checkout = searchParams.get('checkout');
    if (checkout === 'cancelled') {
      setMessage('');
      setError('Checkout was cancelled. You can try again whenever you are ready.');
      setSearchParams({});
      premiumService.getSubscription().then((data) => setSubscription(data.subscription));
      return;
    }
    if (checkout === 'success' && sessionId) {
      setCheckingCheckout(true);
      premiumService.confirmCheckoutSession(sessionId)
        .then((data) => {
          setSubscription(data.subscription);
          setMessage(data.active ? 'Premium activated successfully. Welcome to CyberNest Premium!' : data.message);
          setError('');
          setSearchParams({});
        })
        .catch((requestError) => setError(getApiError(requestError)))
        .finally(() => setCheckingCheckout(false));
      return;
    }
    premiumService.getSubscription().then((data) => setSubscription(data.subscription));
  }, [searchParams, setSearchParams]);
  const upgrade = async () => {
    try {
      setError('');
      setMessage('');
      const data = await premiumService.createCheckoutSession(selectedPlan);
      setMessage('Redirecting to Stripe Checkout...');
      window.location.href = data.checkoutUrl;
    }
    catch (requestError) { setError(getApiError(requestError)); }
  };
  const boost = async () => {
    try {
      const data = await premiumService.boost();
      setSubscription((current) => ({
        ...current,
        boostsRemaining: data.boostsRemaining,
        boostedUntil: data.boostedUntil,
      }));
      setMessage(data.message);
    }
    catch (requestError) { setError(getApiError(requestError)); }
  };
  const active = subscription?.plan === 'premium' && subscription?.status === 'active';
  const boostMsLeft = subscription?.boostedUntil ? Math.max(0, new Date(subscription.boostedUntil).getTime() - now) : 0;
  const boostCooldown = boostMsLeft > 0;
  const boostLabel = boostCooldown
    ? `Boost active ${String(Math.floor(boostMsLeft / 60000)).padStart(2, '0')}:${String(Math.floor((boostMsLeft % 60000) / 1000)).padStart(2, '0')}`
    : `Boost now (${subscription?.boostsRemaining || 0} remaining)`;
  return <section className="mx-auto min-h-screen max-w-4xl px-4 pb-12 pt-24"><p className="text-sm font-bold uppercase tracking-wider text-amber-300">CyberNest Premium</p><h1 className="mt-2 text-5xl">More ways to find your spark</h1><div className="mt-6"><Alert>{error}</Alert><Alert type="success">{message}</Alert></div>{active && <div className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-5 text-amber-100"><h2 className="text-xl font-semibold">Premium is active</h2><p className="mt-1 text-sm text-amber-100/70">Your subscription is enabled. Premium purchase is disabled for this account.</p></div>}<div className="mt-8 grid gap-4 sm:grid-cols-2">{features.map(([icon, title]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><span className="text-pink-300">{icon}</span><h2 className="mt-3 text-xl">{title}</h2></div>)}</div>{active ? <button onClick={boost} disabled={boostCooldown || !subscription?.boostsRemaining} className="btn-primary mt-8 disabled:cursor-not-allowed disabled:opacity-60"><Rocket size={18} /> {boostLabel}</button> : <button onClick={upgrade} disabled={checkingCheckout} className="btn-primary mt-8 disabled:cursor-not-allowed disabled:opacity-60"><Crown size={18} /> {checkingCheckout ? 'Activating premium...' : 'Start premium with Stripe'}</button>}</section>;
}
