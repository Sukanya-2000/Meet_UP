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
  final contactName = TextEditingController();
  final contactPhone = TextEditingController();
  DateTime scheduledFor = DateTime.now().add(const Duration(hours: 1));
  Map<String, dynamic>? trust;
  List checkIns = [];
  String? error;

  @override
  void initState() { super.initState(); load(); }
  @override
  void dispose() { venue.dispose(); contactName.dispose(); contactPhone.dispose(); super.dispose(); }

  Future<void> load() async {
    try {
      final app = context.read<AppState>();
      final results = await Future.wait([app.safetyTrust(), app.safetyCheckIns()]);
      trust = results[0]['trust']; checkIns = results[1]['checkIns'] as List? ?? []; error = null;
    } catch (e) { error = '$e'; }
    if (mounted) setState(() {});
  }

  Future<void> schedule() async {
    if (venue.text.trim().isEmpty) return;
    await context.read<AppState>().createSafetyCheckIn(scheduledFor, venue.text.trim(), trustedContactName: contactName.text.trim(), trustedContactPhone: contactPhone.text.trim());
    venue.clear(); contactName.clear(); contactPhone.clear(); await load();
  }

  @override
  Widget build(BuildContext context) => RefreshIndicator(onRefresh: load, child: ListView(padding: const EdgeInsets.all(18), children: [
    Text('Safety Center', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
    const Text('Practical controls for safer conversations and in-person plans.'),
    if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
    Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.verified_user), title: const Text('Trust profile'), trailing: Text('${trust?['score'] ?? '—'}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold))),
      const Text('Based on explainable account, profile, photo, verification and standing signals.'),
      const SizedBox(height: 10),
      if (trust?['signals'] is Map) for (final signal in Map<String, dynamic>.from(trust!['signals']).entries) Padding(padding: const EdgeInsets.only(bottom: 5), child: Row(children: [Icon(signal.value == true ? Icons.check_circle : Icons.radio_button_unchecked, size: 18, color: signal.value == true ? Colors.green : Colors.grey), const SizedBox(width: 7), Text(signal.key.replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m[1]}'))])),
    ]))),
    const Card(child: Padding(padding: EdgeInsets.all(18), child: Text('Meet in public, arrange your own transport, keep home and work addresses private, tell someone you trust, and never send money or financial credentials.'))),
    Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Schedule Nest Check-In', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 12), TextField(controller: venue, decoration: const InputDecoration(labelText: 'Public venue')),
      const SizedBox(height: 12), Row(children: [Expanded(child: TextField(controller: contactName, decoration: const InputDecoration(labelText: 'Trusted contact'))), const SizedBox(width: 8), Expanded(child: TextField(controller: contactPhone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone')))]),
      const SizedBox(height: 12), OutlinedButton.icon(onPressed: _pickSchedule, icon: const Icon(Icons.schedule), label: Text('${scheduledFor.toLocal()}'.substring(0, 16))),
      const SizedBox(height: 12), FilledButton.icon(onPressed: schedule, icon: const Icon(Icons.add_alert), label: const Text('Schedule check-in')),
    ]))),
    const SizedBox(height: 8), const Text('Your check-ins', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
    if (checkIns.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(24), child: Text('No check-ins scheduled.'))),
    for (final item in checkIns) _CheckInCard(item: Map<String, dynamic>.from(item), reload: load),
    const Card(child: ListTile(leading: Icon(Icons.phone, color: Colors.redAccent), title: Text('Emergency help'), subtitle: Text('Contact your local emergency number when danger is immediate.'))),
    const Card(child: ListTile(leading: Icon(Icons.person_off), title: Text('Block freely'), subtitle: Text('Blocking is private and removes discovery and chat access.'))),
    const Card(child: ListTile(leading: Icon(Icons.report), title: Text('Report concerns'), subtitle: Text('Use profile and chat safety menus to reach moderators.'))),
  ]));

  Future<void> _pickSchedule() async {
    final date = await showDatePicker(context: context, initialDate: scheduledFor, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(scheduledFor));
    if (time != null) setState(() => scheduledFor = DateTime(date.year, date.month, date.day, time.hour, time.minute));
  }
}

class _CheckInCard extends StatelessWidget {
  const _CheckInCard({required this.item, required this.reload});
  final Map<String, dynamic> item;
  final Future<void> Function() reload;
  @override
  Widget build(BuildContext context) {
    final actionable = item['status'] == 'scheduled' || item['status'] == 'overdue';
    return Card(child: ListTile(title: Text('${item['venue']}'), subtitle: Text('${item['scheduledFor']}\n${item['status']}'), isThreeLine: true, trailing: actionable ? Wrap(children: [
      IconButton(tooltip: "I'm safe", onPressed: () async { await context.read<AppState>().updateSafetyCheckIn('${item['_id']}', 'safe'); await reload(); }, icon: const Icon(Icons.check_circle, color: Colors.green)),
      IconButton(tooltip: 'Need help', onPressed: () async { await context.read<AppState>().updateSafetyCheckIn('${item['_id']}', 'needs-help'); await reload(); }, icon: const Icon(Icons.warning, color: Colors.red)),
    ]) : null));
  }
}
