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

class _LikedYouScreenState extends State<LikedYouScreen>
    with SingleTickerProviderStateMixin {
  late final TabController tabs;
  List<Map<String, dynamic>> received = [];
  List<Map<String, dynamic>> sent = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    tabs = TabController(length: 2, vsync: this);
    load();
  }

  @override
  void dispose() {
    tabs.dispose();
    super.dispose();
  }

  Future<void> load() async {
    try {
      final app = context.read<AppState>();
      final result = await Future.wait([app.sentLikes(), app.receivedLikes()]);
      sent = result[0];
      received = result[1];
      error = null;
    } catch (e) {
      error = '$e';
    }
    if (mounted) setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Likes',
              style: Theme.of(
                context,
              ).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            TabBar(
              controller: tabs,
              tabs: [
                Tab(text: 'You liked (${sent.length})'),
                Tab(text: 'Liked you (${received.length})'),
              ],
            ),
            if (error != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  error!,
                  style: const TextStyle(color: Colors.redAccent),
                ),
              ),
          ],
        ),
      ),
      Expanded(
        child: loading
            ? const Center(child: CircularProgressIndicator())
            : TabBarView(
                controller: tabs,
                children: [
                  _LikesList(items: sent, received: false, reload: load),
                  _LikesList(items: received, received: true, reload: load),
                ],
              ),
      ),
    ],
  );
}

class _LikesList extends StatelessWidget {
  const _LikesList({
    required this.items,
    required this.received,
    required this.reload,
  });
  final List<Map<String, dynamic>> items;
  final bool received;
  final Future<void> Function() reload;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return RefreshIndicator(
        onRefresh: reload,
        child: ListView(
          children: [
            const SizedBox(height: 100),
            Icon(
              Icons.favorite_border,
              size: 52,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 14),
            Center(
              child: Text(
                received
                    ? 'No new likes right now'
                    : "You haven't liked anyone yet",
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            Center(
              child: Text(
                received
                    ? 'New incoming likes will appear here.'
                    : 'Likes sent from Discovery will appear here.',
              ),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: reload,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: .62,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: items.length,
        itemBuilder: (_, index) =>
            _LikeCard(item: items[index], received: received, reload: reload),
      ),
    );
  }
}

class _LikeCard extends StatelessWidget {
  const _LikeCard({
    required this.item,
    required this.received,
    required this.reload,
  });
  final Map<String, dynamic> item;
  final bool received;
  final Future<void> Function() reload;

  @override
  Widget build(BuildContext context) {
    final profile = Map<String, dynamic>.from(item['profile'] ?? {});
    final rawPhoto = item['photo'] ?? profile['photo'];
    final photo = rawPhoto is Map
        ? '${rawPhoto['imageUrl'] ?? ''}'
        : '$rawPhoto';
    final id = '${item['likeId'] ?? item['_id']}';
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: photo.isEmpty
                ? const Icon(Icons.person, size: 64)
                : Image.network(
                    ApiClient.instance.absoluteUrl(photo),
                    fit: BoxFit.cover,
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${profile['firstName'] ?? 'Member'}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  '${profile['city'] ?? ''}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                if (!received)
                  const Chip(
                    label: Text('Like sent'),
                    visualDensity: VisualDensity.compact,
                  ),
                if (received)
                  Row(
                    children: [
                      Expanded(
                        child: IconButton(
                          tooltip: 'Pass',
                          onPressed: () async {
                            await context.read<AppState>().passLike(id);
                            await reload();
                          },
                          icon: const Icon(Icons.close),
                        ),
                      ),
                      Expanded(
                        child: FilledButton(
                          onPressed: () async {
                            final result = await context
                                .read<AppState>()
                                .acceptLike(id);
                            if (context.mounted &&
                                result['conversationId'] != null) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatScreen(
                                    conversationId:
                                        '${result['conversationId']}',
                                  ),
                                ),
                              );
                            }
                            await reload();
                          },
                          child: const Icon(Icons.check),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
