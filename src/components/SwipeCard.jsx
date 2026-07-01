import { Camera, Heart, Home, MapPin, ShieldCheck, Star, X } from 'lucide-react';
import { useRef, useState } from 'react';

const ageFromDob = (dob) => {
  const born = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age;
};

export default function SwipeCard({ profile, motion, onPass, onLike, onSuperLike }) {
  const [imageFailed, setImageFailed] = useState(false);
  const orderedPhotos = [...(profile.photos || [])].sort((a, b) => Number(b.isMain) - Number(a.isMain));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef(null);
  const main = orderedPhotos[photoIndex];
  const distance = profile.distanceKm ?? 3;
  const isOnline = !!profile.isOnline;
  const details = [
    profile.zodiac,
    profile.education,
    profile.communicationStyle,
    profile.loveStyle,
    profile.pets,
  ].filter(Boolean);
  const badges = profile.modeBadges?.length ? profile.modeBadges : details;
  const swiping = dragStart.current !== null;

  const startDrag = (event) => {
    if (motion || event.button > 0) return;
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (dragStart.current === null || motion) return;
    setDragX(event.clientX - dragStart.current);
  };

  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (Math.abs(dragX) >= 90) {
      if (dragX > 0) onLike();
      else onPass();
    }
    setDragX(0);
  };

  const motionTransform = motion === 'left'
    ? 'translateX(-130%) rotate(-12deg)'
    : motion === 'right'
      ? 'translateX(130%) rotate(12deg)'
      : `translateX(${dragX}px) rotate(${dragX / 24}deg)`;

  return (
    <article
      className={`absolute inset-0 touch-pan-y select-none ${motion ? 'opacity-0' : ''}`}
      style={{ transform: motionTransform, transition: swiping ? 'none' : 'transform 300ms, opacity 300ms' }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="relative h-[calc(100%-88px)] overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 shadow-2xl">
        {main && !imageFailed ? (
          <img src={main.imageUrl} alt={profile.firstName} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white/70">
            <Camera size={58} />
            <p className="mt-3">No photo yet</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

        <div className={`absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {isOnline ? 'Active' : 'Offline'}
        </div>
        {!!orderedPhotos.length && (
          <div className="absolute left-4 right-4 top-3 flex gap-1" aria-label={`Photo ${photoIndex + 1} of ${orderedPhotos.length}`}>
            {orderedPhotos.map((photo, index) => (
              <span key={photo._id || photo.imageUrl} className={`h-1 flex-1 rounded-full shadow ${index === photoIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
        <div className="absolute right-5 top-7 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {photoIndex + 1}/{Math.max(orderedPhotos.length, 1)}
        </div>

        {orderedPhotos.length > 1 && (
          <div className="absolute inset-x-0 top-12 flex h-[48%]" aria-label="Browse profile photos">
            <button className="h-full w-1/2 cursor-w-resize" onClick={() => setPhotoIndex((index) => Math.max(0, index - 1))} aria-label="Previous photo" />
            <button className="h-full w-1/2 cursor-e-resize" onClick={() => setPhotoIndex((index) => Math.min(orderedPhotos.length - 1, index + 1))} aria-label="Next photo" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2">
            <h2 className="text-4xl font-bold">{profile.firstName}, {ageFromDob(profile.dob)}</h2>
            {profile.isVerified && <ShieldCheck size={22} className="text-sky-300" fill="currentColor" />}
          </div>
          <p className="mt-3 flex items-center gap-2 text-base text-white/90"><Home size={18} /> Lives in {profile.city}</p>
          <p className="mt-2 flex items-center gap-2 text-base text-white/90"><MapPin size={18} /> {distance} km away</p>
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/75">{profile.bio || 'Looking for real conversations and good vibes.'}</p>

          {!!profile.interests?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.slice(0, 4).map((interest) => <span key={interest} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{interest}</span>)}
            </div>
          )}
          {!!badges.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.slice(0, 4).map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur">{item}</span>)}
            </div>
          )}
        </div>
      </div>
      <div className="flex h-[88px] items-center justify-center gap-10" onPointerDown={(event) => event.stopPropagation()}>
        <button onClick={onPass} className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-soft transition hover:scale-105" title="Dislike" aria-label="Dislike profile">
          <X size={36} strokeWidth={3} />
        </button>
        <button onClick={onSuperLike} className="flex h-14 w-14 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-500 shadow-soft transition hover:-translate-y-1 hover:scale-105" title="Super Spark" aria-label="Send Super Spark"><Star size={30} fill="currentColor" /></button>
        <button onClick={onLike} className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-500 shadow-soft transition hover:scale-105" title="Like" aria-label="Like profile">
          <Heart size={34} fill="currentColor" />
        </button>
      </div>
    </article>
  );
}
