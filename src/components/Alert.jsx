export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = type === 'success'
    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    : 'border-rose-400/20 bg-rose-400/10 text-rose-200';
  return <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
