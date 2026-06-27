import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../providers/app_state.dart';
import 'chat_screen.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});
  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  Map<String, dynamic>? data;
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    final next = await context.read<AppState>().requests();
    if (mounted) setState(() => data = next);
  }
  @override
  Widget build(BuildContext context) {
    final received = data?['received'] as List? ?? [];
    final sent = data?['sent'] as List? ?? [];
    return ListView(padding: const EdgeInsets.all(18), children: [
      Text('Requests', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
      const SizedBox(height: 16),
      const Text('Received', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
      if (received.isEmpty) const Padding(padding: EdgeInsets.all(20), child: Text('No pending requests')),
      for (final item in received) _RequestTile(item: Map<String, dynamic>.from(item), received: true, reload: load),
      const SizedBox(height: 20),
      const Text('Sent', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
      for (final item in sent) _RequestTile(item: Map<String, dynamic>.from(item), received: false, reload: load),
    ]);
  }
}

class _RequestTile extends StatelessWidget {
  const _RequestTile({required this.item, required this.received, required this.reload});
  final Map<String, dynamic> item; final bool received; final Future<void> Function() reload;
  @override
  Widget build(BuildContext context) {
    final p = item['profile'] as Map?;
    final photo = item['photo'] as Map?;
    return Card(child: ListTile(
      leading: CircleAvatar(backgroundImage: photo?['imageUrl'] == null ? null : NetworkImage(ApiClient.instance.absoluteUrl('${photo?['imageUrl']}'))),
      title: Text('${p?['firstName'] ?? 'Member'}'),
      subtitle: Text('${p?['city'] ?? ''} • ${item['status']}'),
      trailing: received ? Wrap(children: [
        IconButton(icon: const Icon(Icons.check), onPressed: () async { await context.read<AppState>().respondRequest('${item['_id']}', 'accepted'); await reload(); }),
        IconButton(icon: const Icon(Icons.close), onPressed: () async { await context.read<AppState>().respondRequest('${item['_id']}', 'declined'); await reload(); }),
      ]) : item['conversationId'] != null ? IconButton(icon: const Icon(Icons.chat), onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(conversationId: '${item['conversationId']}')))) : null,
    ));
  }
}
