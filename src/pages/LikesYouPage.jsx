import { Heart, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import premiumService from '../services/premiumService';
import { getApiError } from '../utils/apiError';

export default function LikesYouPage() {
  const [likes, setLikes] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { premiumService.getLikesYou().then((data) => setLikes(data.likes)).catch((requestError) => setError(getApiError(requestError))); }, []);
  return <section className="mx-auto min-h-screen max-w-5xl px-4 pb-12 pt-24"><h1 className="text-4xl">Likes You</h1><p className="mt-2 text-white/45">People who already felt a spark.</p><div className="mt-6"><Alert>{error}</Alert></div>{error && <Link to="/premium" className="mt-5 inline-flex items-center gap-2 text-pink-300"><LockKeyhole size={17} /> Unlock with Premium</Link>}<div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{likes.map((profile) => <div key={profile._id} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-purple-950">{profile.photo && <img src={profile.photo.imageUrl} alt={profile.firstName} className="h-full w-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" /><div className="absolute bottom-0 p-4"><h2 className="font-semibold">{profile.firstName}</h2><p className="text-xs text-white/55">{profile.city}</p></div><Heart className="absolute right-3 top-3 text-pink-400" fill="currentColor" /></div>)}</div></section>;
}
