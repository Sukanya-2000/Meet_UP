export const discoveryModes = ['for-you', 'double-date', 'astrology', 'music', 'matchmaker', 'share-date', 'verified-only', 'online-now', 'new-members'];

export const discoveryModeMeta = {
  'for-you': {
    title: 'For You',
    emptyReason: 'NO_FRESH_PROFILES',
    activeCopy: 'For You profiles are active',
  },
  'verified-only': {
    title: 'Verified Only',
    emptyReason: 'NO_VERIFIED_PROFILES',
    activeCopy: 'Verified profiles are active',
  },
  'online-now': {
    title: 'Online Now',
    emptyReason: 'NO_ONLINE_PROFILES',
    activeCopy: 'Online profiles are active',
  },
  'new-members': {
    title: 'New Members',
    emptyReason: 'NO_NEW_MEMBERS',
    activeCopy: 'New member profiles are active',
  },
  'double-date': {
    title: 'Double Date',
    emptyReason: 'NO_DOUBLE_DATE_PROFILES',
    activeCopy: 'Double Date profiles are active',
  },
  astrology: {
    title: 'Astrology Mode',
    emptyReason: 'NO_ASTROLOGY_PROFILES',
    activeCopy: 'Astrology mode is active',
  },
  music: {
    title: 'Music Mode',
    emptyReason: 'NO_MUSIC_PROFILES',
    activeCopy: 'Music profiles are active',
  },
  matchmaker: {
    title: 'Matchmaker',
    emptyReason: 'NO_MATCHMAKER_PROFILES',
    activeCopy: 'Matchmaker profiles are active',
  },
  'share-date': {
    title: 'Share My Date',
    emptyReason: 'NO_SHARE_DATE_PROFILES',
    activeCopy: 'Share Date profiles are active',
  },
};

export const zodiacSigns = [
  'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
  'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
];

const compatibilityGroups = {
  Aries: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
  Taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
  Gemini: ['Libra', 'Aquarius', 'Aries', 'Leo'],
  Cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
  Leo: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
  Virgo: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
  Libra: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
  Scorpio: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
  Sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius'],
  Capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
  Aquarius: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
  Pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
};

export const zodiacFromDob = (dob) => {
  const date = new Date(dob);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const starts = [
    [1, 20, 'Aquarius'], [2, 19, 'Pisces'], [3, 21, 'Aries'], [4, 20, 'Taurus'],
    [5, 21, 'Gemini'], [6, 21, 'Cancer'], [7, 23, 'Leo'], [8, 23, 'Virgo'],
    [9, 23, 'Libra'], [10, 23, 'Scorpio'], [11, 22, 'Sagittarius'], [12, 22, 'Capricorn'],
  ];
  return starts.reduce((sign, [startMonth, startDay, name]) =>
    month > startMonth || (month === startMonth && day >= startDay) ? name : sign, 'Capricorn');
};

export const stableZodiacForProfile = (profile) => {
  if (profile.zodiac) return profile.zodiac;
  const source = String(profile.userId || profile._id || profile.firstName || '');
  const total = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return zodiacSigns[total % zodiacSigns.length] || zodiacFromDob(profile.dob);
};

export const compatibilityScore = (mySign, theirSign) => {
  if (!mySign || !theirSign) return 60;
  if (mySign === theirSign) return 88;
  const matches = compatibilityGroups[mySign] || [];
  if (matches.slice(0, 2).includes(theirSign)) return 96;
  if (matches.includes(theirSign)) return 82;
  return 58;
};

const musicOverlapScore = (profile, preferredInterests = []) => {
  const profileInterests = new Set((profile.interests || []).map(String));
  const artists = profile.music?.topArtists || [];
  const genres = profile.music?.topGenres || [];
  const musicSignals = ['Music', 'Movies', ...artists, ...genres, ...preferredInterests];
  const overlap = musicSignals.filter((item) => profileInterests.has(item)).length;
  return overlap * 12 + artists.length * 5 + genres.length * 3 + (profile.music?.anthem ? 8 : 0);
};

const modeScore = (profile, context) => {
  const freshness = profile.createdAt ? Math.max(0, 20 - Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000)) : 0;
  const completeness = [
    profile.bio,
    profile.photos?.length,
    profile.interests?.length,
    profile.isVerified,
  ].filter(Boolean).length * 5;
  const online = profile.isOnline ? 18 : 0;
  const verified = profile.isVerified ? 15 : 0;
  const boost = profile.boostRank ? 10 : 0;

  if (context.mode === 'astrology') return profile.astrologyCompatibility?.score || 0;
  if (context.mode === 'music') return musicOverlapScore(profile, context.interests) + completeness + online;
  if (context.mode === 'verified-only') return verified + completeness + online;
  if (context.mode === 'online-now') return online + completeness + freshness;
  if (context.mode === 'new-members') return freshness + completeness;
  if (context.mode === 'double-date') return completeness + online + (profile.interests?.length || 0);
  if (context.mode === 'matchmaker') return completeness + verified + (profile.trustScore || 0) / 10;
  if (context.mode === 'share-date') return completeness + verified + online;
  return boost + completeness + verified + online + freshness;
};

export const enrichAndRankProfiles = ({ profiles, photos, context, isUserOnline }) => {
  let data = profiles.map((profile) => {
    const zodiac = stableZodiacForProfile(profile);
    const score = compatibilityScore(context.myZodiac, zodiac);
    const profilePhotos = photos.filter((photo) => photo.userId.equals(profile.userId));
    const enriched = {
      ...profile,
      zodiac,
      astrology: {
        sun: profile.astrology?.sun || zodiac,
        moon: profile.astrology?.moon || zodiacSigns[(zodiacSigns.indexOf(zodiac) + 9) % zodiacSigns.length],
        rising: profile.astrology?.rising || zodiacSigns[(zodiacSigns.indexOf(zodiac) + 4) % zodiacSigns.length],
      },
      astrologyCompatibility: {
        mySign: context.myZodiac,
        theirSign: zodiac,
        score,
        label: score >= 90 ? 'Cosmic match' : score >= 80 ? 'Strong vibe' : 'Different energy',
      },
      isOnline: Boolean(profile.user?.demoOnline) || isUserOnline(profile.userId),
      distanceKm: Math.min(context.maximumDistance, 3 + Math.floor(Math.random() * Math.max(context.maximumDistance, 4))),
      discoveryVersion: '1.2.0',
      modeBadges: [
        profile.isVerified ? 'Verified' : '',
        profile.user?.demoOnline || isUserOnline(profile.userId) ? 'Active now' : '',
        context.mode === 'astrology' ? `${score}% astro` : '',
        context.mode === 'music' && profile.music?.anthem ? profile.music.anthem : '',
      ].filter(Boolean),
      rankingSignals: {
        compatibility: score,
        online: Boolean(profile.user?.demoOnline) || isUserOnline(profile.userId),
        verified: Boolean(profile.isVerified),
        completeness: [profile.bio, profilePhotos.length, profile.interests?.length].filter(Boolean).length,
        musicOverlap: musicOverlapScore(profile, context.interests),
      },
      photos: profilePhotos,
    };
    return { ...enriched, modeScore: modeScore(enriched, context) };
  });

  if (context.mode === 'astrology') {
    const ranked = data.slice().sort((a, b) => b.astrologyCompatibility.score - a.astrologyCompatibility.score);
    const compatible = ranked.filter((profile) => context.compatibility === 'all'
      || (context.compatibility === 'high' && profile.astrologyCompatibility.score >= 90)
      || (context.compatibility === 'medium' && profile.astrologyCompatibility.score >= 80));
    data = compatible.length ? compatible : ranked;
  } else {
    data = data.sort((a, b) => b.modeScore - a.modeScore);
  }

  return data.map(({ modeScore: _modeScore, ...profile }) => profile);
};
