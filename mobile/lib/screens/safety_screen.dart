import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';

class SafetyScreen extends StatefulWidget {
  const SafetyScreen({super.key});
  @override
  State<SafetyScreen> createState() => _SafetyScreenState();
}

class _SafetyScreenState extends State<SafetyScreen> {
  final venue = TextEditingController();
  Map<String, dynamic>? trust;
  List checkIns = [];
  String? error;

  @override
  void initState() { super.initState(); load(); }
  @override
  void dispose() { venue.dispose(); super.dispose(); }
  Future<void> load() async {
    try {
      final app = context.read<AppState>();
      final results = await Future.wait([app.safetyTrust(), app.safetyCheckIns()]);
      trust = results[0]['trust'];
      checkIns = results[1]['checkIns'] as List? ?? [];
      error = null;
    } catch (e) { error = '$e'; }
    if (mounted) setState(() {});
  }
  Future<void> schedule() async {
    if (venue.text.trim().isEmpty) return;
    await context.read<AppState>().createSafetyCheckIn(DateTime.now().add(const Duration(hours: 1)), venue.text.trim());
    venue.clear(); await load();
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(onRefresh: load, child: ListView(padding: const EdgeInsets.all(18), children: [
    Text('Safety Center', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
    const Text('Practical tools for safer conversations and meetings.'),
    if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
    Card(child: ListTile(leading: const Icon(Icons.verified_user), title: const Text('Trust score'), trailing: Text('${trust?['score'] ?? '—'}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)))),
    const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('Meet in public, arrange your own transport, tell someone you trust, and never send money or financial credentials.'))),
    Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Schedule Nest Check-In', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 12), TextField(controller: venue, decoration: const InputDecoration(labelText: 'Public venue')),
      const SizedBox(height: 12), FilledButton.icon(onPressed: schedule, icon: const Icon(Icons.add_alert), label: const Text('Check in after 1 hour')),
    ]))),
    const SizedBox(height: 8), const Text('Your check-ins', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
    for (final item in checkIns) _CheckInCard(item: Map<String, dynamic>.from(item), reload: load),
  ]));
}

class _CheckInCard extends StatelessWidget {
  const _CheckInCard({required this.item, required this.reload});
  final Map<String, dynamic> item;
  final Future<void> Function() reload;

  @override
  Widget build(BuildContext context) {
    final actionable = item['status'] == 'scheduled' || item['status'] == 'overdue';
    return Card(
      child: ListTile(
        title: Text('${item['venue']}'),
        subtitle: Text('${item['scheduledFor']}'),
        trailing: actionable
            ? Wrap(children: [
                IconButton(
                  onPressed: () async {
                    await context.read<AppState>().updateSafetyCheckIn('${item['_id']}', 'safe');
                    await reload();
                  },
                  icon: const Icon(Icons.check_circle, color: Colors.green),
                ),
                IconButton(
                  onPressed: () async {
                    await context.read<AppState>().updateSafetyCheckIn('${item['_id']}', 'needs-help');
                    await reload();
                  },
                  icon: const Icon(Icons.warning, color: Colors.red),
                ),
              ])
            : Text('${item['status']}'),
      ),
    );
  }
}
