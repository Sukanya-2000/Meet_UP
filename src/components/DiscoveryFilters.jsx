import {
  AtSign,
  Baby,
  BookOpen,
  Check,
  ChevronRight,
  Dumbbell,
  Eye,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  MessageCircleHeart,
  Moon,
  PawPrint,
  SlidersHorizontal,
  Cigarette,
  Wine,
} from 'lucide-react';

const filterRows = [
  { key: 'interests', label: 'Interests', icon: Heart, options: ['Coffee', 'Travel', 'Fitness', 'Movies', 'Music', 'Books', 'Photography', 'Gaming'] },
  { key: 'lookingFor', label: 'Looking for', icon: Eye, options: ['Long-term partner', 'Short-term fun', 'New friends', 'Still figuring it out'] },
  { key: 'openTo', label: 'Open to...', icon: Heart, options: ['Dates', 'Chats', 'Adventure', 'Networking'] },
  { key: 'languages', label: 'Add languages', icon: Languages, options: ['English', 'Hindi', 'French', 'Spanish', 'Punjabi'] },
  { key: 'zodiac', label: 'Zodiac', icon: Moon, options: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] },
  { key: 'education', label: 'Education', icon: GraduationCap, options: ['High school', 'College', 'In grad school', 'Graduate degree'] },
  { key: 'familyPlans', label: 'Family Plans', icon: Baby, options: ['Want someday', "Don’t want", 'Have kids', 'Open to kids'] },
  { key: 'communicationStyle', label: 'Communication Style', icon: MessageCircleHeart, options: ['Texter', 'Caller', 'Voice notes', 'In person'] },
  { key: 'loveStyle', label: 'Love Style', icon: BookOpen, options: ['Thoughtful gestures', 'Time together', 'Touch', 'Words of affirmation'] },
  { key: 'pets', label: 'Pets', icon: PawPrint, options: ['Dog', 'Cat', 'No pets', 'Allergic'] },
  { key: 'drinking', label: 'Drinking', icon: Wine, options: ['Never', 'Socially', 'Often'] },
  { key: 'smoking', label: 'Smoking', icon: Cigarette, options: ['Never', 'Socially', 'Often'] },
  { key: 'workout', label: 'Workout', icon: Dumbbell, options: ['Every day', 'Often', 'Sometimes', 'Never'] },
  { key: 'socialMedia', label: 'Social Media', icon: AtSign, options: ['Active', 'Scroller', 'Offline-ish'] },
];

const selectedSummary = (items = []) => items.length ? `${items.length} selected` : 'Select';

export default function DiscoveryFilters({ filters, setFilters, onApply, onClose }) {
  const toggleListValue = (key, value) => {
    const current = filters[key] || [];
    setFilters({
      ...filters,
      [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  const setValue = (key, value) => setFilters({ ...filters, [key]: value });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <SlidersHorizontal size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Discovery Settings</h2>
          <button onClick={onApply} className="rounded-full bg-slate-900 p-3 text-white shadow-soft">
            <Check size={24} />
          </button>
        </div>

        <div className="space-y-7 px-4 py-6 sm:px-8">
          <section>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Discovery</p>
            <div className="rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-lg font-semibold">Location</p>
                  <p className="mt-1 text-sm text-slate-500">Change locations to find matches anywhere.</p>
                </div>
                <div className="flex items-center gap-2 text-right text-slate-600"><MapPin size={17} /> {filters.location || 'Current city'} <ChevronRight size={18} /></div>
              </div>

              <label className="mt-5 block">
                <div className="mb-2 flex justify-between text-lg font-semibold"><span>Maximum Distance</span><span>{filters.distanceKm} km</span></div>
                <input className="w-full accent-rose-500" type="range" min="1" max="500" value={filters.distanceKm} onChange={(e) => setValue('distanceKm', e.target.value)} />
              </label>
              <label className="mt-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4 text-slate-600">
                <span>Show people further away if I run out of profiles to see.</span>
                <input type="checkbox" checked={filters.expandDistance} onChange={(e) => setValue('expandDistance', e.target.checked)} />
              </label>

              <label className="mt-5 block border-b border-slate-100 pb-4">
                <div className="mb-2 flex justify-between text-lg font-semibold"><span>Interested In</span></div>
                <select className="input" value={filters.gender} onChange={(e) => setValue('gender', e.target.value)}>
                  <option value="">Everyone</option>
                  <option value="woman">Women</option>
                  <option value="man">Men</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-lg font-semibold"><span>Age Range</span><span>{filters.ageMin}-{filters.ageMax}</span></div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="number" min="18" max="100" value={filters.ageMin} onChange={(e) => setValue('ageMin', e.target.value)} />
                  <input className="input" type="number" min="18" max="100" value={filters.ageMax} onChange={(e) => setValue('ageMax', e.target.value)} />
                </div>
              </div>
              <label className="mt-4 flex items-center justify-between gap-4 text-slate-600">
                <span>Show people slightly out of my preferred range if I run out of profiles to see.</span>
                <input type="checkbox" checked={filters.expandAgeRange} onChange={(e) => setValue('expandAgeRange', e.target.checked)} />
              </label>
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Premium Discovery <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs text-amber-950">Gold</span></p>
            <p className="mb-4 text-slate-500">Preferences show people who match your vibe, but won’t hard-block everyone outside your picks.</p>
            <div className="rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-sm">
              <label className="block border-b border-slate-100 pb-5">
                <div className="mb-2 flex justify-between text-lg font-semibold"><span>Minimum Number of Photos</span><span>{filters.minimumPhotos}</span></div>
                <input className="w-full accent-rose-500" type="range" min="0" max="6" value={filters.minimumPhotos} onChange={(e) => setValue('minimumPhotos', e.target.value)} />
              </label>
              <label className="flex items-center justify-between border-b border-slate-100 py-4 text-lg font-semibold">
                Has a Bio
                <input type="checkbox" checked={filters.hasBio} onChange={(e) => setValue('hasBio', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between border-b border-slate-100 py-4 text-lg font-semibold">
                Verified profiles only
                <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setValue('verifiedOnly', e.target.checked)} />
              </label>
              {filterRows.map(({ key, label, options }) => (
                <div key={key} className="border-b border-slate-100 py-4 last:border-b-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-lg font-semibold"><Icon size={20} className="text-slate-400" /> {label}</div>
                    <span className="text-slate-500">{selectedSummary(filters[key])} <ChevronRight className="inline" size={18} /></span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleListValue(key, option)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${filters[key]?.includes(option) ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
