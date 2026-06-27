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
  @override
  void initState() { super.initState(); refresh(); }
  Future<void> refresh() async {
    setState(() => loading = true);
    try { profiles = await context.read<AppState>().discovery(); error = null; }
    catch (e) { error = '$e'; }
    if (mounted) setState(() => loading = false);
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

  @override
  Widget build(BuildContext context) {
    final p = profiles.isEmpty ? null : profiles.first;
    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView(padding: const EdgeInsets.all(18), children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Discovery', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
          IconButton(onPressed: refresh, icon: const Icon(Icons.tune)),
        ]),
        if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
        if (loading) const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
        if (!loading && p == null) const Padding(padding: EdgeInsets.all(40), child: Center(child: Text('You are all caught up.'))),
        if (p != null) _ProfileCard(profile: p),
        const SizedBox(height: 18),
        Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
          _Round(icon: Icons.undo, color: Colors.amber, onTap: () => context.read<AppState>().rewind().then((_) => refresh())),
          _Round(icon: Icons.close, color: Colors.redAccent, onTap: () => act('pass')),
          _Round(big: true, icon: Icons.favorite, color: AppTheme.coral, onTap: () => act('like')),
          _Round(icon: Icons.star, color: Colors.teal, onTap: () => act('favorite')),
          _Round(icon: Icons.bolt, color: Colors.purple, onTap: () => context.read<AppState>().boost()),
        ]),
        TextButton.icon(onPressed: () => act('request'), icon: const Icon(Icons.group_add), label: const Text('Send connection request')),
      ]),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.profile});
  final Profile profile;
  @override
  Widget build(BuildContext context) {
    final photo = profile.photos.isNotEmpty ? profile.photos.first.url : '';
    return Container(
      height: 560,
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(34), boxShadow: [BoxShadow(color: AppTheme.coral.withOpacity(.18), blurRadius: 30)]),
      clipBehavior: Clip.antiAlias,
      child: Stack(children: [
        Positioned.fill(child: photo.isEmpty ? const Icon(Icons.person, size: 120) : Image.network(ApiClient.instance.absoluteUrl(photo), fit: BoxFit.cover)),
        Positioned.fill(child: DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black.withOpacity(.78)])))),
        Positioned(left: 24, right: 24, bottom: 24, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${profile.firstName}, ${_age(profile.dob)}', style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900)),
          Text(profile.city, style: const TextStyle(color: Colors.white70)),
          const SizedBox(height: 10),
          Text(profile.bio.isEmpty ? 'Looking for real conversations and good vibes.' : profile.bio, style: const TextStyle(color: Colors.white)),
          const SizedBox(height: 10),
          Wrap(spacing: 6, children: profile.interests.take(5).map((i) => Chip(label: Text(i))).toList()),
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
