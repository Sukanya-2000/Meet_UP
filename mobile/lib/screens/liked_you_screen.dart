import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../providers/app_state.dart';
import 'chat_screen.dart';

class LikedYouScreen extends StatefulWidget {
  const LikedYouScreen({super.key});
  @override
  State<LikedYouScreen> createState() => _LikedYouScreenState();
}

class _LikedYouScreenState extends State<LikedYouScreen> {
  List<Map<String, dynamic>>? data;
  String? error;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      data = await context.read<AppState>().receivedLikes();
      error = null;
    } catch (e) {
      error = '$e';
    }
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final likes = data ?? [];
    return RefreshIndicator(
      onRefresh: load,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text('Liked You', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          const Text('Accept a like to create a match and open chat.'),
          const SizedBox(height: 16),
          if (error != null) Text(error!, style: const TextStyle(color: Colors.redAccent)),
          if (data == null && error == null) const Center(child: CircularProgressIndicator()),
          if (data != null && likes.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(28), child: Center(child: Text('No likes waiting yet.')))),
          for (final item in likes) _LikeCard(item: item, reload: load),
        ],
      ),
    );
  }
}

class _LikeCard extends StatelessWidget {
  const _LikeCard({required this.item, required this.reload});
  final Map<String, dynamic> item;
  final Future<void> Function() reload;

  @override
  Widget build(BuildContext context) {
    final profile = Map<String, dynamic>.from(item['profile'] ?? {});
    final rawPhoto = item['photo'] ?? profile['photo'];
    final photo = rawPhoto is Map ? Map<String, dynamic>.from(rawPhoto) : null;
    final image = '${photo?['imageUrl'] ?? (rawPhoto is String ? rawPhoto : '')}';
    final interests = (profile['interests'] as List? ?? []).take(4).map((e) => '$e').toList();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            CircleAvatar(radius: 34, backgroundImage: image.isEmpty ? null : NetworkImage(ApiClient.instance.absoluteUrl(image)), child: image.isEmpty ? const Icon(Icons.person) : null),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${profile['firstName'] ?? 'Member'}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                Text('${profile['city'] ?? ''}'),
                Wrap(spacing: 4, children: interests.map((i) => Chip(label: Text(i), visualDensity: VisualDensity.compact)).toList()),
              ]),
            ),
            IconButton(
              tooltip: 'Pass',
              icon: const Icon(Icons.close),
              onPressed: () async {
                await context.read<AppState>().passLike('${item['likeId'] ?? item['_id']}');
                await reload();
              },
            ),
            FilledButton(
              onPressed: () async {
                final res = await context.read<AppState>().acceptLike('${item['likeId'] ?? item['_id']}');
                if (context.mounted && res['conversationId'] != null) {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(conversationId: '${res['conversationId']}')));
                }
                await reload();
              },
              child: const Text('Accept'),
            ),
          ],
        ),
      ),
    );
  }
}
