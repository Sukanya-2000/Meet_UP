import {
  BadgeCheck,
  CalendarHeart,
  Heart,
  Info,
  LoaderCircle,
  MessageCircleHeart,
  MoonStar,
  Music,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserPlus,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import DiscoveryFilters from '../components/DiscoveryFilters';
import MatchModal from '../components/MatchModal';
import SwipeCard from '../components/SwipeCard';
import discoveryService from '../services/discoveryService';
import matchService from '../services/matchService';
import { getApiError } from '../utils/apiError';

const initialFilters = {
  ageMin: 18,
  ageMax: 60,
  distanceKm: 50,
  gender: '',
  verifiedOnly: false,
  minimumPhotos: 0,
  hasBio: false,
  expandDistance: false,
  expandAgeRange: false,
  interests: [],
  lookingFor: [],
  openTo: [],
  languages: [],
  zodiac: [],
  education: [],
  familyPlans: [],
  communicationStyle: [],
  loveStyle: [],
  pets: [],
  drinking: [],
  smoking: [],
  workout: [],
  socialMedia: [],
};

const discoveryModes = [
  { id: 'for-you', label: 'For You', icon: Sparkles, title: 'For You', copy: 'Best picks from your discovery settings.', accent: 'from-rose-400 to-orange-400' },
  { id: 'verified-only', label: 'Verified', icon: BadgeCheck, title: 'Verified Only', copy: 'Profiles with verification signals are prioritized here.', accent: 'from-sky-500 to-blue-700' },
  { id: 'online-now', label: 'Online Now', icon: Radio, title: 'Online Now', copy: 'People currently active in CyberNest appear first.', accent: 'from-emerald-500 to-teal-700' },
  { id: 'new-members', label: 'New Members', icon: UserPlus, title: 'New Members', copy: 'Recently joined profiles get a brighter first look.', accent: 'from-fuchsia-500 to-pink-700' },
  { id: 'double-date', label: 'Double Date', icon: UsersRound, title: 'Double Date', copy: 'Profiles ready for pair-style discovery. Friend pairing can plug in here next.', accent: 'from-pink-500 to-rose-500' },
  { id: 'astrology', label: 'Astrology', icon: MoonStar, title: 'Astrology Mode', copy: 'Swipe with sun, moon, and rising insights.', accent: 'from-violet-700 to-purple-950' },
  { id: 'music', label: 'Music', icon: Music, title: 'Music Mode', copy: 'Discover people through artists, anthems, and shared listening vibes.', accent: 'from-indigo-600 to-slate-950' },
  { id: 'matchmaker', label: 'Matchmaker', icon: MessageCircleHeart, title: 'Matchmaker', copy: 'Browse profiles friends could recommend once invite voting is connected.', accent: 'from-sky-500 to-indigo-700' },
  { id: 'share-date', label: 'Share Date', icon: CalendarHeart, title: 'Share My Date', copy: 'Browse matches you may want to plan and share date details with later.', accent: 'from-emerald-500 to-teal-700' },
];

const zodiacOptions = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function AstrologyIntro({ onClose, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-b from-violet-700 via-indigo-900 to-purple-950 p-8 text-center text-white shadow-2xl">
        <button onClick={onClose} className="absolute left-5 top-5 rounded-full border border-white/30 p-3 text-white/80"><X size={22} /></button>
        <div className="mx-auto mt-8 flex h-36 items-center justify-center rounded-[2rem] bg-white/10">
          <Sparkles size={38} className="text-pink-200" />
          <span className="mx-6 text-7xl">☀️</span>
          <span className="text-6xl">🌙</span>
        </div>
        <h2 className="mt-8 text-4xl font-bold">Try Astrology Mode</h2>
        <p className="mt-4 text-lg text-white/75">Astrology Mode gives you quick, fun insights into how you and potential matches vibe astrologically.</p>
        <button onClick={onContinue} className="mt-8 w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-slate-900">Continue</button>
        <button onClick={onClose} className="mt-5 font-bold text-white">Maybe Later</button>
      </div>
    </div>
  );
}

function AstrologyMode({ profile, onClose, onEnter }) {
  const rows = [
    ['☀️', `Sun in ${profile?.astrology?.sun || profile?.zodiac || 'Sagittarius'} ♐`, 'Your core personality', "You’re adventurous, honest, and endlessly curious. You’re always pondering the big questions in life."],
    ['🌙', `Moon in ${profile?.astrology?.moon || 'Libra'} ♎`, 'Your emotional side', 'You process emotions by talking them out. You seek balance and are definitely the type to make a pro/con list.'],
    ['☁️', `Rising in ${profile?.astrology?.rising || 'Aquarius'} ♒`, 'How others see you', "You present yourself as unconventional. From your style to the things you say, others can immediately tell you’re one-of-a-kind."],
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-violet-700 via-indigo-950 to-purple-950 p-5 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col py-6">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="rounded-full border border-white/30 p-3"><X size={24} /></button>
          <button className="rounded-full border border-white/30 p-3"><Info size={24} /></button>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-xl font-bold text-white/75"><MoonStar size={22} /> CyberNest Astrology</p>
            <h2 className="mt-3 text-5xl font-bold">About You</h2>
          </div>
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white">
            {profile?.photos?.[0]?.imageUrl ? <img src={profile.photos[0].imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="h-full w-full bg-white/20" />}
          </div>
        </div>
        <div className="mt-10 space-y-10">
          {rows.map(([emoji, sign, title, copy]) => (
            <div key={title} className="flex gap-5">
              <span className="text-5xl">{emoji}</span>
              <div>
                <p className="text-lg font-bold text-pink-200">{sign}</p>
                <h3 className="mt-1 text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-lg leading-relaxed text-white/75">{copy}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="mt-auto w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-slate-900">Enter Astrology mode</button>
      </div>
    </div>
  );
}

function ModeBanner({ mode, profile, astrologyEnabled, onAboutYou, astrologyPrefs, setAstrologyPrefs, replayingSeenProfiles }) {
  const Icon = mode.icon;
  const isAstrology = mode.id === 'astrology';

  return (
    <div className={`mb-3 w-full max-w-md overflow-hidden rounded-[1.75rem] bg-gradient-to-r ${mode.accent} p-4 text-white shadow-soft`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/70"><Icon size={16} /> {mode.label}</p>
          <h2 className="mt-1 text-2xl font-bold">{mode.title}</h2>
          <p className="mt-1 text-sm text-white/75">{mode.copy}</p>
          {replayingSeenProfiles && <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">Replay mode: you’ve seen the fresh stack, so we’re showing eligible profiles again for testing.</p>}
        </div>
        {isAstrology && astrologyEnabled && (
          <button onClick={onAboutYou} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950">About You</button>
        )}
      </div>
      {isAstrology && astrologyEnabled && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="rounded-2xl bg-white/10 p-3 text-xs font-bold">
              <span className="mb-1 block text-white/60">Your sign</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/95 px-2 py-2 text-sm font-bold text-slate-900 outline-none"
                value={astrologyPrefs.myZodiac}
                onChange={(event) => setAstrologyPrefs((value) => ({ ...value, myZodiac: event.target.value }))}
              >
                {zodiacOptions.map((sign) => <option key={sign} value={sign}>{sign}</option>)}
              </select>
            </label>
            <label className="rounded-2xl bg-white/10 p-3 text-xs font-bold">
              <span className="mb-1 block text-white/60">Compatibility</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/95 px-2 py-2 text-sm font-bold text-slate-900 outline-none"
                value={astrologyPrefs.compatibility}
                onChange={(event) => setAstrologyPrefs((value) => ({ ...value, compatibility: event.target.value }))}
              >
                <option value="all">All profiles</option>
                <option value="medium">Strong vibe+</option>
                <option value="high">Cosmic match</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="rounded-2xl bg-white/10 p-3"><Sun className="mx-auto mb-1 text-pink-200" size={18} />{profile?.astrology?.sun || profile?.zodiac || 'Sagittarius'} Sun</div>
            <div className="rounded-2xl bg-white/10 p-3"><MoonStar className="mx-auto mb-1 text-sky-200" size={18} />{profile?.astrology?.moon || 'Libra'} Moon</div>
            <div className="rounded-2xl bg-white/10 p-3"><Sparkles className="mx-auto mb-1 text-violet-200" size={18} />{profile?.astrology?.rising || 'Aquarius'} Rising</div>
          </div>
          {profile?.astrologyCompatibility && (
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold">
              {profile.astrologyCompatibility.label}: {profile.astrologyCompatibility.score}% with {profile.astrologyCompatibility.theirSign}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscoveryEmptyState({ mode, emptyReason, onRefresh }) {
  return (
    <div className="glass flex h-full flex-col items-center justify-center rounded-[2rem] px-8 text-center">
      <Heart className="text-coral-400" size={48} />
      <h1 className="mt-5 text-3xl">No profiles right now</h1>
      <p className="mt-3 text-slate-500">
        {emptyReason === 'NO_REPLAYABLE_PROFILES'
          ? 'There are no eligible profiles after your block/filter settings.'
          : `No ${mode.label.toLowerCase()} profiles matched this filter set.`}
      </p>
      <button onClick={onRefresh} className="mt-6 rounded-full bg-coral-gradient px-6 py-3 text-sm font-bold text-white shadow-soft">Refresh stack</button>
    </div>
  );
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', motion: '', page: 1, hasMore: false, replayingSeenProfiles: false, emptyReason: null, activeCopy: '' });
  const [newMatch, setNewMatch] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAstrologyIntro, setShowAstrologyIntro] = useState(false);
  const [showAstrology, setShowAstrology] = useState(false);
  const [astrologyEnabled, setAstrologyEnabled] = useState(false);
  const [activeMode, setActiveMode] = useState('for-you');
  const [astrologyPrefs, setAstrologyPrefs] = useState({ myZodiac: 'Sagittarius', compatibility: 'all' });
  const [filters, setFilters] = useState(initialFilters);
  const current = profiles[0];
  const currentMode = useMemo(() => discoveryModes.find((mode) => mode.id === activeMode) || discoveryModes[0], [activeMode]);

  const load = useCallback(async (page = 1, append = false) => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    try {
      const requestFilters = {
        ...filters,
        mode: activeMode,
        ...(activeMode === 'astrology' ? astrologyPrefs : {}),
      };
      const data = await discoveryService.getDiscovery(page, 10, requestFilters);
      setProfiles((items) => append ? [...items, ...data.profiles] : data.profiles);
      setState({
        loading: false,
        error: '',
        motion: '',
        page,
        hasMore: data.pagination.hasMore,
        replayingSeenProfiles: !!data.discovery?.replayingSeenProfiles,
        emptyReason: data.discovery?.emptyReason || null,
        activeCopy: data.discovery?.activeCopy || '',
      });
    } catch (error) {
      setState((value) => ({ ...value, loading: false, error: getApiError(error) }));
    }
  }, [activeMode, astrologyPrefs, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (profiles.length <= 2 && state.hasMore && !state.loading) load(state.page + 1, true);
  }, [load, profiles.length, state.hasMore, state.loading, state.page]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showFilters || showAstrology || showAstrologyIntro) return;
      if (event.key === 'ArrowLeft') act('pass');
      if (event.key === 'ArrowRight') act('like');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectMode = (modeId) => {
    setActiveMode(modeId);
    if (modeId === 'astrology' && !astrologyEnabled) setShowAstrologyIntro(true);
  };

  const enterAstrologyMode = () => {
    setAstrologyEnabled(true);
    setActiveMode('astrology');
    setShowAstrology(false);
    setShowAstrologyIntro(false);
  };

  const act = async (action) => {
    if (!current || state.motion) return;
    const motion = action === 'pass' ? 'left' : 'right';
    setState((value) => ({ ...value, motion }));
    try {
      const result = action === 'super-like'
        ? await matchService.superLike(current.userId)
        : action === 'like' ? await matchService.like(current.userId) : await discoveryService.swipe(current.userId, action);
      if (result.matched && result.isNewMatch) setNewMatch(result.match);
      window.setTimeout(() => {
        setProfiles((items) => items.slice(1));
        setState((value) => ({ ...value, motion: '' }));
      }, 280);
    } catch (error) {
      setState((value) => ({ ...value, motion: '', error: getApiError(error) }));
    }
  };

  return (
    <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center px-4 pb-24 pt-24 text-slate-800">
      <MatchModal match={newMatch} onClose={() => setNewMatch(null)} />
      {showFilters && <DiscoveryFilters filters={filters} setFilters={setFilters} onApply={() => { setShowFilters(false); load(1); }} onClose={() => setShowFilters(false)} />}
      {showAstrologyIntro && <AstrologyIntro onClose={() => setShowAstrologyIntro(false)} onContinue={() => { setShowAstrologyIntro(false); setShowAstrology(true); }} />}
      {showAstrology && <AstrologyMode profile={current} onClose={() => setShowAstrology(false)} onEnter={enterAstrologyMode} />}

      <div className="mb-4 flex w-full max-w-md items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-coral-500">Discover</p>
          <h1 className="text-4xl">Find your spark</h1>
        </div>
        <button onClick={() => setShowFilters(true)} className="flex shrink-0 items-center gap-2 rounded-full bg-coral-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft"><SlidersHorizontal size={16} /> Filters</button>
      </div>

      <div className="spark-scrollbar mb-4 w-full max-w-md overflow-x-auto pb-3">
        <div className="flex gap-2 text-sm font-bold">
          {discoveryModes.map((mode) => {
            const Icon = mode.icon;
            const active = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => selectMode(mode.id)}
                className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 transition ${active ? 'bg-slate-900 text-white shadow-soft' : 'bg-white/85 text-slate-500 hover:bg-white'}`}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3 w-full max-w-md"><Alert>{state.error}</Alert></div>
      <ModeBanner
        mode={currentMode}
        profile={current}
        astrologyEnabled={astrologyEnabled}
        onAboutYou={() => setShowAstrology(true)}
        astrologyPrefs={astrologyPrefs}
        setAstrologyPrefs={setAstrologyPrefs}
        replayingSeenProfiles={state.replayingSeenProfiles}
      />

      <div className="relative mt-1 w-full max-w-md" style={{ height: 'min(72vh, 700px)', minHeight: 560 }}>
        {profiles.slice(0, 2).reverse().map((profile, reverseIndex) => {
          const isCurrent = reverseIndex === profiles.slice(0, 2).length - 1;
          return <SwipeCard key={profile._id} profile={profile} motion={isCurrent ? state.motion : ''} onPass={() => act('pass')} onLike={() => act('like')} onSuperLike={() => act('super-like')} />;
        })}
        {state.loading && !current && <div className="glass flex h-full items-center justify-center rounded-[2rem]"><LoaderCircle className="animate-spin text-coral-400" size={34} /></div>}
        {!state.loading && !current && <DiscoveryEmptyState mode={currentMode} emptyReason={state.emptyReason} onRefresh={() => load(1)} />}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-slate-400">
        <Zap size={14} className="text-coral-400" />
        {state.activeCopy || (activeMode === 'astrology' && astrologyEnabled ? 'Astrology mode is active' : `${currentMode.label} profiles are active`)}
      </div>
    </section>
  );
}
