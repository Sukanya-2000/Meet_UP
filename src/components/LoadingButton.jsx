import { LoaderCircle } from 'lucide-react';

export default function LoadingButton({ isLoading, children, ...props }) {
  return (
    <button className="btn-primary" disabled={isLoading} {...props}>
      {isLoading && <LoaderCircle size={18} className="animate-spin" />}
      {isLoading ? 'Please wait…' : children}
    </button>
  );
}
