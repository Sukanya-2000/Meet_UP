import { Heart, MessageCircle, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MatchModal({ match, onClose }) {
  const navigate = useNavigate();
  if (!match) return null;
  const people = match.people || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0614]/90 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-pink-400/20 bg-gradient-to-br from-[#3b163c] to-[#1a0d2d] p-7 text-center shadow-2xl shadow-pink-900/40 sm:p-10">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        <Sparkles className="mx-auto text-pink-300" size={30} />
        <h2 className="mt-3 text-5xl font-extrabold italic text-transparent bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text">It&apos;s a Match!</h2>
        <p className="mt-3 text-white/60">You both liked each other. The spark is mutual.</p>
        <div className="mt-8 flex items-center justify-center">
          {people.map((person, index) => (
            <div key={person.userId} className={`relative h-32 w-32 overflow-hidden rounded-full border-4 border-pink-400 bg-purple-900 shadow-xl ${index ? '-ml-5' : ''}`}>
              {person.photo ? <img src={person.photo.imageUrl} alt={person.firstName} className="h-full w-full object-cover" /> : <Heart className="m-auto mt-10 text-pink-300" />}
            </div>
          ))}
        </div>
        {!!match.sharedInterests?.length && <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/35">Shared interests</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">{match.sharedInterests.map((interest) => <span key={interest} className="rounded-full bg-pink-400/15 px-3 py-1.5 text-sm text-pink-200">{interest}</span>)}</div>
        </div>}
        <button onClick={() => navigate(`/chat/${match._id}`)} className="btn-primary mt-8"><MessageCircle size={19} /> Send a message</button>
        <button onClick={onClose} className="mt-4 text-sm font-semibold text-white/55 hover:text-white">Continue swiping</button>
      </div>
    </div>
  );
}
