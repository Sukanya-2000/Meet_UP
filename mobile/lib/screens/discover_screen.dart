import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../core/app_theme.dart';
import '../models/cyber_models.dart';
import '../providers/app_state.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});
  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  List<Profile> profiles = [];
  bool loading = true;
  String? error;
  RangeValues ages = const RangeValues(18, 60);
  String gender = '';
  String mode = 'for-you';
  String myZodiac = 'Sagittarius';
  String compatibility = 'all';
  final modes = const [
    ['for-you', 'For You'],
    ['online-now', 'Online'],
    ['verified-only', 'Verified'],
    ['new-members', 'New'],
    ['astrology', 'Astrology'],
    ['music', 'Music'],
    ['double-date', 'Double Date'],
    ['matchmaker', 'Matchmaker'],
    ['share-date', 'Share Date'],
  ];
  @override
  void initState() { super.initState(); refresh(); }
  Future<void> refresh() async {
    setState(() => loading = true);
    try { profiles = await context.read<AppState>().discovery(ageMin: ages.start.round(), ageMax: ages.end.round(), gender: gender, mode: mode, myZodiac: myZodiac, compatibility: compatibility); error = null; }
    catch (e) { error = '$e'; }
    if (mounted) setState(() => loading = false);
  }
  Future<void> filters() async {
    var draftAges = ages;
    var draftGender = gender;
    final applied = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => StatefulBuilder(builder: (context, setSheetState) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Discovery filters', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900)),
          const SizedBox(height: 20),
          Text('Age ${draftAges.start.round()}–${draftAges.end.round()}'),
          RangeSlider(values: draftAges, min: 18, max: 60, divisions: 42, labels: RangeLabels('${draftAges.start.round()}', '${draftAges.end.round()}'), onChanged: (value) => setSheetState(() => draftAges = value)),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(initialValue: draftGender, decoration: const InputDecoration(labelText: 'Show me'), items: const [
            DropdownMenuItem(value: '', child: Text('Everyone')),
            DropdownMenuItem(value: 'woman', child: Text('Women')),
            DropdownMenuItem(value: 'man', child: Text('Men')),
            DropdownMenuItem(value: 'non-binary', child: Text('Non-binary')),
            DropdownMenuItem(value: 'other', child: Text('Other')),
          ], onChanged: (value) => setSheetState(() => draftGender = value ?? '')),
          const SizedBox(height: 20),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Apply filters')),
        ]),
      )),
    );
    if (applied == true) {
      setState(() { ages = draftAges; gender = draftGender; });
      await refresh();
    }
  }
  Future<void> act(String action) async {
    if (profiles.isEmpty) return;
    final current = profiles.first;
    final app = context.read<AppState>();
    try {
      if (action == 'like') {
        final res = await app.like(current.userId);
        if (res['matched'] == true && mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("It's a Match!")));
      } else if (action == 'request') {
        await app.sendRequest(current.userId);
      } else {
        await app.swipe(current.userId, action);
      }
      setState(() => profiles.removeAt(0));
    } catch (e) { setState(() => error = '$e'); }
  }
  Future<void> gestureAct(String action, Profile profile) async {
    setState(() => profiles.removeWhere((item) => item.userId == profile.userId));
    try {
      final app = context.read<AppState>();
      if (action == 'like') {
        final result = await app.like(profile.userId);
        if (result['matched'] == true && mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("It's a Match!")));
      } else {
        await app.swipe(profile.userId, action);
      }
    } catch (e) {
      if (mounted) setState(() { profiles.insert(0, profile); error = '$e'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = profiles.isEmpty ? null : profiles.first;
    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView(padding: const EdgeInsets.all(18), children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Discovery', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
          IconButton(onPressed: filters, icon: const Icon(Icons.tune)),
        ]),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: modes.map((item) {
            final active = mode == item[0];
            return Padding(
              padding: const EdgeInsets.only(right: 8, bottom: 12),
              child: ChoiceChip(
                selected: active,
                label: Text(item[1]),
                onSelected: (_) async {
                  setState(() => mode = item[0]);
                  await refresh();
                },
              ),
            );
          }).toList()),
        ),
        if (mode == 'astrology') Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              Expanded(child: DropdownButtonFormField<String>(
                initialValue: myZodiac,
                decoration: const InputDecoration(labelText: 'Your sign'),
                items: const ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => DropdownMenuItem(value: sign, child: Text(sign))).toList(),
                onChanged: (value) async { if (value == null) return; setState(() => myZodiac = value); await refresh(); },
              )),
              const SizedBox(width: 12),
              Expanded(child: DropdownButtonFormField<String>(
                initialValue: compatibility,
                decoration: const InputDecoration(labelText: 'Compatibility'),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All profiles')),
                  DropdownMenuItem(value: 'medium', child: Text('Strong vibe+')),
                  DropdownMenuItem(value: 'high', child: Text('Cosmic match')),
                ],
                onChanged: (value) async { if (value == null) return; setState(() => compatibility = value); await refresh(); },
              )),
            ]),
          ),
        ),
        if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
        if (loading) const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
        if (!loading && p == null) const Padding(padding: EdgeInsets.all(40), child: Center(child: Text('You are all caught up.'))),
        if (p != null) Dismissible(
          key: ValueKey(p.userId),
          direction: DismissDirection.horizontal,
          background: const _SwipeBackground(alignment: Alignment.centerLeft, color: Colors.green, icon: Icons.favorite, label: 'LIKE'),
          secondaryBackground: const _SwipeBackground(alignment: Alignment.centerRight, color: Colors.redAccent, icon: Icons.close, label: 'PASS'),
          onDismissed: (direction) => gestureAct(direction == DismissDirection.startToEnd ? 'like' : 'pass', p),
          child: GestureDetector(
            onDoubleTap: () => act('like'),
            child: _ProfileCard(profile: p),
          ),
        ),
      ]),
    );
  }
}

class _SwipeBackground extends StatelessWidget {
  const _SwipeBackground({required this.alignment, required this.color, required this.icon, required this.label});
  final Alignment alignment;
  final Color color;
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
        alignment: alignment,
        padding: const EdgeInsets.symmetric(horizontal: 34),
        decoration: BoxDecoration(color: color.withValues(alpha: .9), borderRadius: BorderRadius.circular(34)),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: Colors.white, size: 42),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
        ]),
      );
}

class _ProfileCard extends StatefulWidget {
  const _ProfileCard({required this.profile});
  final Profile profile;
  @override
  State<_ProfileCard> createState() => _ProfileCardState();
}

class _ProfileCardState extends State<_ProfileCard> {
  int photoIndex = 0;
  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;
    final photo = profile.photos.isNotEmpty ? profile.photos[photoIndex].url : '';
    return Container(
      height: 560,
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(34), boxShadow: [BoxShadow(color: AppTheme.coral.withValues(alpha: .18), blurRadius: 30)]),
      clipBehavior: Clip.antiAlias,
      child: Stack(children: [
        Positioned.fill(child: photo.isEmpty ? const Icon(Icons.person, size: 120) : Image.network(ApiClient.instance.absoluteUrl(photo), fit: BoxFit.cover)),
        Positioned.fill(child: DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black.withValues(alpha: .78)])))),
        if (profile.photos.length > 1) Positioned(left: 12, right: 12, top: 12, child: Row(children: List.generate(profile.photos.length, (index) => Expanded(child: Container(height: 4, margin: const EdgeInsets.symmetric(horizontal: 2), decoration: BoxDecoration(color: index == photoIndex ? Colors.white : Colors.white38, borderRadius: BorderRadius.circular(4))))))),
        if (profile.photos.length > 1) Positioned(left: 0, right: 0, top: 30, height: 260, child: Row(children: [
          Expanded(child: Semantics(button: true, label: 'Previous photo', child: GestureDetector(behavior: HitTestBehavior.translucent, onTap: () => setState(() => photoIndex = (photoIndex - 1).clamp(0, profile.photos.length - 1))))),
          Expanded(child: Semantics(button: true, label: 'Next photo', child: GestureDetector(behavior: HitTestBehavior.translucent, onTap: () => setState(() => photoIndex = (photoIndex + 1).clamp(0, profile.photos.length - 1))))),
        ])),
        Positioned(left: 24, right: 24, bottom: 112, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5), decoration: BoxDecoration(color: profile.isOnline ? const Color(0xFFDFFFF0) : Colors.white70, borderRadius: BorderRadius.circular(20)), child: Text(profile.isOnline ? 'Active' : 'Offline', style: TextStyle(color: profile.isOnline ? const Color(0xFF087A45) : Colors.black54, fontWeight: FontWeight.w800))),
          const SizedBox(height: 8),
          Text('${profile.firstName}, ${_age(profile.dob)}', style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900)),
          Row(children: [const Icon(Icons.location_on_outlined, color: Colors.white70, size: 19), const SizedBox(width: 4), Expanded(child: Text(profile.city.isEmpty ? 'Location unavailable' : profile.city, style: const TextStyle(color: Colors.white70)))]),
          if (profile.westernZodiac.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 5), child: Row(children: [const Icon(Icons.auto_awesome, color: Color(0xFFFFD166), size: 18), const SizedBox(width: 5), Text('${profile.westernZodiac} · Western astrology', style: const TextStyle(color: Colors.white))])),
          const SizedBox(height: 10),
          Text(profile.bio.isEmpty ? 'Looking for real conversations and good vibes.' : profile.bio, style: const TextStyle(color: Colors.white)),
          const SizedBox(height: 10),
          Wrap(spacing: 6, children: profile.interests.take(5).map((i) => Chip(label: Text(i))).toList()),
        ])),
        Positioned(left: 0, right: 0, bottom: 20, child: Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
          _Round(big: true, icon: Icons.close, color: Colors.redAccent, onTap: () => context.findAncestorStateOfType<_DiscoverScreenState>()?.act('pass')),
          _Round(big: true, icon: Icons.favorite, color: AppTheme.coral, onTap: () => context.findAncestorStateOfType<_DiscoverScreenState>()?.act('like')),
        ])),
      ]),
    );
  }
  int _age(String? dob) {
    if (dob == null) return 25;
    final d = DateTime.tryParse(dob);
    if (d == null) return 25;
    final now = DateTime.now();
    return now.year - d.year - ((now.month < d.month || (now.month == d.month && now.day < d.day)) ? 1 : 0);
  }
}

class _Round extends StatelessWidget {
  const _Round({required this.icon, required this.color, required this.onTap, this.big = false});
  final IconData icon; final Color color; final VoidCallback onTap; final bool big;
  @override
  Widget build(BuildContext context) => InkWell(onTap: onTap, borderRadius: BorderRadius.circular(40), child: CircleAvatar(radius: big ? 36 : 28, backgroundColor: Colors.white, child: Icon(icon, color: color, size: big ? 34 : 25)));
}
