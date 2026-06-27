import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../models/cyber_models.dart';
import '../providers/app_state.dart';
import 'chat_screen.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});
  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen> {
  late Future<List<MatchItem>> future = context.read<AppState>().matches();

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => setState(() => future = context.read<AppState>().matches()),
      child: FutureBuilder<List<MatchItem>>(
        future: future,
        builder: (context, snap) {
          final items = snap.data ?? [];
          return ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text('Connections', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text('Matches and chats, ready when the spark is.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 18),
              if (snap.connectionState == ConnectionState.waiting) const Center(child: CircularProgressIndicator()),
              if (snap.hasError) Text('${snap.error}', style: const TextStyle(color: Colors.redAccent)),
              if (!snap.hasError && snap.connectionState != ConnectionState.waiting && items.isEmpty)
                const Card(child: Padding(padding: EdgeInsets.all(28), child: Center(child: Text('No matches yet.')))),
              for (final m in items)
                Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundImage: (m.photo?.url ?? '').isEmpty ? null : NetworkImage(ApiClient.instance.absoluteUrl(m.photo!.url)),
                      child: (m.photo?.url ?? '').isEmpty ? const Icon(Icons.person) : null,
                    ),
                    title: Text(m.profile?.firstName ?? 'CyberNest member'),
                    subtitle: Text(m.lastMessage?['message']?.toString() ?? m.profile?.city ?? 'Say hello'),
                    trailing: Badge(
                      isLabelVisible: m.unreadCount > 0,
                      label: Text('${m.unreadCount}'),
                      child: const Icon(Icons.chevron_right),
                    ),
                    onTap: () {
                      final id = m.conversationId ?? m.id;
                      Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(conversationId: id, match: m)));
                    },
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
