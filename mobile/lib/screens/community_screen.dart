import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../providers/app_state.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  bool loading = true;
  String? error;
  List<Map<String, dynamic>> events = [];
  Map<String, dynamic> collections = {};
  Map<String, dynamic> campus = {};
  Map<String, dynamic> music = {};

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() { loading = true; error = null; });
    final app = context.read<AppState>();
    final failures = <String>[];
    try { final data = await app.events(); events = (data['events'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)).toList(); } catch (_) { failures.add('events'); }
    try { final data = await app.curatedDiscovery(); collections = Map<String, dynamic>.from(data['collections'] ?? {}); } catch (_) { failures.add('curated picks'); }
    try { campus = await app.campusOverview(); } catch (_) { failures.add('campus'); }
    try { final data = await app.musicProfile(); music = Map<String, dynamic>.from(data['music'] ?? {}); } catch (_) { failures.add('music'); }
    if (failures.isNotEmpty) error = 'Some Community sections are temporarily unavailable: ${failures.join(', ')}. Pull down to retry.';
    if (mounted) setState(() => loading = false);
  }

  Future<void> connectSpotify() async {
    try {
      final data = await context.read<AppState>().spotifyConnect();
      final uri = Uri.parse('${data['url']}');
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) throw Exception('Could not open Spotify');
    } catch (e) {
      if (mounted) setState(() => error = 'Campus Mode is temporarily unavailable. Please wait a moment and try again.');
    }
  }

  Future<void> joinCampus() async {
    var institutionId = '';
    var institutionLabel = 'Choose institution';
    var manualOther = false;
    final customInstitution = TextEditingController();
    final email = TextEditingController();
    final year = TextEditingController(text: '${DateTime.now().year + 1}');
    final submitted = await showDialog<bool>(context: context, builder: (context) => StatefulBuilder(builder: (context, setDialogState) => AlertDialog(
      title: const Text('Join Campus Mode'),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        ListTile(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: BorderSide(color: Theme.of(context).colorScheme.outline)), leading: const Icon(Icons.school_outlined), title: Text(institutionLabel), trailing: const Icon(Icons.arrow_drop_down), onTap: () async { final item = await showSearch<Map<String, dynamic>?>(context: context, delegate: _InstitutionSearch()); if (item != null) setDialogState(() { institutionId = 'other'; manualOther = item['manual'] == true; institutionLabel = '${item['name']}'; customInstitution.text = manualOther ? '' : institutionLabel; }); }),
        if (manualOther) ...[
          const SizedBox(height: 12),
          TextField(controller: customInstitution, decoration: const InputDecoration(labelText: 'Your institution name')),
        ],
        const SizedBox(height: 12),
        TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Institution email')),
        const SizedBox(height: 12),
        TextField(controller: year, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Graduation year')),
      ]),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit'))],
    )));
    if (submitted != true) return;
    if (institutionId.isEmpty) { if (mounted) setState(() => error = 'Choose an institution before submitting.'); return; }
    try {
      await context.read<AppState>().campusJoin({'institutionId': institutionId, if (institutionId == 'other') 'customInstitutionName': customInstitution.text.trim(), 'email': email.text.trim(), 'graduationYear': int.tryParse(year.text)});
      await load();
    } catch (e) {
      if (mounted) setState(() => error = _campusError(e));
    }
  }

  String _campusError(Object value) {
    if (value is DioException) {
      final message = value.response?.data is Map ? value.response?.data['message'] : null;
      if (message != null && '$message'.trim().isNotEmpty) return '$message';
      if (value.response?.statusCode == 500 || value.response?.statusCode == 502 || value.response?.statusCode == 503) return 'Campus Mode is temporarily unavailable. Please wait a moment and try again.';
    }
    return 'Could not join Campus Mode. Check your institution email and try again.';
  }

  @override
  Widget build(BuildContext context) {
    final membership = campus['membership'] as Map?;
    return RefreshIndicator(onRefresh: load, child: ListView(padding: const EdgeInsets.all(18), children: [
      Text('Community', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
      const Text('Curated picks, events, music and campus connections.'),
      if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: const TextStyle(color: Colors.red))),
      if (loading) const Padding(padding: EdgeInsets.all(40), child: Center(child: CircularProgressIndicator())),
      if (!loading) ...[
        const SizedBox(height: 18),
        Card(child: ListTile(leading: const Icon(Icons.music_note, color: Color(0xFF1DB954)), title: Text(music.isEmpty ? 'Connect Spotify' : 'Spotify connected'), subtitle: Text(music.isEmpty ? 'Use shared artists and listening taste in discovery.' : '${(music['topArtists'] as List? ?? []).length} top artists synced'), trailing: music.isEmpty ? FilledButton(onPressed: connectSpotify, child: const Text('Connect')) : IconButton(tooltip: 'Disconnect Spotify', onPressed: () async { await context.read<AppState>().disconnectMusic(); await load(); }, icon: const Icon(Icons.link_off)))),
        Card(child: ListTile(leading: const Icon(Icons.school), title: Text(membership == null ? 'Campus Mode' : '${membership['institutionId']?['name'] ?? 'Campus'}'), subtitle: Text(membership == null ? 'Meet verified people from your institution.' : 'Membership status: ${membership['status']}'), trailing: membership == null || membership['status'] == 'rejected' ? FilledButton(onPressed: joinCampus, child: const Text('Join')) : const Icon(Icons.hourglass_top))),
        const SizedBox(height: 16),
        Text('Events', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
        if (events.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No upcoming community events.'))),
        ...events.map((event) => Card(child: ListTile(title: Text('${event['title']}'), subtitle: Text('${event['venue'] ?? ''} · ${event['startsAt'] ?? ''}'), trailing: TextButton(onPressed: () async { await context.read<AppState>().eventAction('${event['_id']}', 'going'); await load(); }, child: const Text('Going'))))),
        ...collections.entries.map((entry) => _Collection(title: entry.key, profiles: entry.value as List? ?? const [])),
      ],
    ]));
  }
}

class _InstitutionSearch extends SearchDelegate<Map<String, dynamic>?> {
  @override List<Widget>? buildActions(BuildContext context) => [IconButton(onPressed: () => query = '', icon: const Icon(Icons.clear))];
  @override Widget? buildLeading(BuildContext context) => IconButton(onPressed: () => close(context, null), icon: const Icon(Icons.arrow_back));
  @override Widget buildResults(BuildContext context) => _results();
  @override Widget buildSuggestions(BuildContext context) => _results();
  Widget _results() {
    return FutureBuilder<List<Map<String, dynamic>>>(future: _catalog(query), builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
      final items = snapshot.data ?? [];
      return ListView.builder(itemCount: items.length + 1, itemBuilder: (context, index) {
        if (index == items.length) return ListTile(leading: const Icon(Icons.add), title: const Text('Other'), subtitle: const Text('Enter an institution not listed'), onTap: () => close(context, {'name': 'Other', 'manual': true}));
        final item = items[index];
        final domains = item['domains'] as List? ?? const [];
        return ListTile(title: Text('${item['name']}'), subtitle: Text('${item['country'] ?? (domains.isEmpty ? '' : domains.first)}'), onTap: () => close(context, {'name': item['name'], 'manual': false}));
      });
    });
  }

  Future<List<Map<String, dynamic>>> _catalog(String value) async {
    final decoded = jsonDecode(await rootBundle.loadString('assets/data/world-universities.json')) as List;
    final term = value.trim().toLowerCase();
    return decoded.map((item) => Map<String, dynamic>.from(item)).where((item) => term.isEmpty || '${item['name']}'.toLowerCase().contains(term)).take(100).toList();
  }
}

class _Collection extends StatelessWidget {
  const _Collection({required this.title, required this.profiles});
  final String title;
  final List profiles;

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    const SizedBox(height: 16),
    Text(title.replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m[1]}'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
    SizedBox(height: 120, child: ListView(scrollDirection: Axis.horizontal, children: profiles.map((raw) { final profile = Map<String, dynamic>.from(raw); return SizedBox(width: 190, child: Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('${profile['firstName'] ?? 'Member'}', style: const TextStyle(fontWeight: FontWeight.bold)), const SizedBox(height: 6), Text(((profile['recommendation']?['reasons'] as List?) ?? const []).join(' · '), maxLines: 3)])))); }).toList())),
  ]);
}
