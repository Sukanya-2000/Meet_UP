import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../core/app_theme.dart';
import '../models/cyber_models.dart';
import '../providers/app_state.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.conversationId, this.match});
  final String conversationId;
  final MatchItem? match;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final input = TextEditingController();
  final scroll = ScrollController();
  List<ChatMessage> messages = [];
  bool loading = true;
  bool sending = false;
  Color bubble = AppTheme.coral;
  String? otherUserId;

  @override
  void initState() {
    super.initState();
    load();
    final sockets = context.read<AppState>().sockets;
    sockets.joinMatch(widget.conversationId);
    sockets.socket?.on('message:new', (_) => load(silent: true));
    sockets.socket?.on('messages:seen', (_) => load(silent: true));
  }

  @override
  void dispose() {
    input.dispose();
    scroll.dispose();
    super.dispose();
  }

  Future<void> load({bool silent = false}) async {
    if (!silent) setState(() => loading = true);
    try {
      final data = await context.read<AppState>().messages(widget.conversationId);
      messages = (data['messages'] as List? ?? []).map((e) => ChatMessage.fromJson(Map<String, dynamic>.from(e))).toList();
      otherUserId = data['otherUserId']?.toString() ?? widget.match?.otherUserId;
    } catch (_) {}
    if (mounted) {
      setState(() => loading = false);
      Future.delayed(const Duration(milliseconds: 80), _bottom);
    }
  }

  void _bottom() {
    if (scroll.hasClients) scroll.animateTo(scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 220), curve: Curves.easeOut);
  }

  Future<void> sendText() async {
    final text = input.text.trim();
    if (text.isEmpty || sending) return;
    setState(() => sending = true);
    input.clear();
    final app = context.read<AppState>();
    try {
      await app.sendMessage({'conversationId': widget.conversationId, 'message': text, 'text': text});
      app.sockets.sendMessage({'conversationId': widget.conversationId, 'message': text, 'text': text});
      await load(silent: true);
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  Future<void> pickMedia() async {
    final result = await FilePicker.pickFiles(allowMultiple: true, type: FileType.any);
    final paths = result?.files.map((f) => f.path).whereType<String>().toList() ?? [];
    if (paths.isEmpty) return;
    setState(() => sending = true);
    try {
      await context.read<AppState>().uploadChatMedia(widget.conversationId, paths.map(File.new).toList());
      await load(silent: true);
    } finally {
      if (mounted) setState(() => sending = false);
    }
  }

  Future<void> safetySheet() async {
    final details = TextEditingController();
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(18, 18, 18, 18 + MediaQuery.of(context).viewInsets.bottom),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Safety tools', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          TextField(controller: details, minLines: 3, maxLines: 5, decoration: const InputDecoration(labelText: 'Report details')),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: otherUserId == null
                ? null
                : () async {
                    await context.read<AppState>().report(otherUserId!, 'chat_report', details.text, false);
                    if (context.mounted) Navigator.pop(context);
                  },
            icon: const Icon(Icons.shield_outlined),
            label: const Text('Submit report'),
          ),
          TextButton.icon(
            onPressed: otherUserId == null
                ? null
                : () async {
                    await context.read<AppState>().block(otherUserId!);
                    if (context.mounted) Navigator.pop(context);
                  },
            icon: const Icon(Icons.block),
            label: const Text('Block without reporting'),
          ),
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.match?.profile?.firstName ?? 'Chat';
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        decoration: AppTheme.pageGradient(context),
        child: SafeArea(
          child: Column(
            children: [
              Card(
                margin: const EdgeInsets.all(10),
                child: ListTile(
                  leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
                  title: Text(name, style: const TextStyle(fontWeight: FontWeight.w900)),
                  subtitle: const Text('online status updates automatically'),
                  trailing: Wrap(spacing: 6, children: [
                    for (final c in [AppTheme.coral, Colors.deepPurple, Colors.teal, Colors.orange])
                      InkWell(
                        onTap: () => setState(() => bubble = c),
                        child: CircleAvatar(radius: 13, backgroundColor: c, child: bubble == c ? const Icon(Icons.check, color: Colors.white, size: 15) : null),
                      ),
                    IconButton(onPressed: safetySheet, icon: const Icon(Icons.more_horiz)),
                  ]),
                ),
              ),
              Expanded(
                child: loading
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        controller: scroll,
                        padding: const EdgeInsets.all(14),
                        itemCount: messages.length,
                        itemBuilder: (context, i) => _Bubble(message: messages[i], mine: messages[i].senderId == context.read<AppState>().userId, color: bubble),
                      ),
              ),
              if (sending) const LinearProgressIndicator(minHeight: 2),
              Padding(
                padding: const EdgeInsets.all(10),
                child: Row(children: [
                  IconButton.filledTonal(onPressed: pickMedia, icon: const Icon(Icons.attach_file)),
                  Expanded(
                    child: TextField(
                      controller: input,
                      minLines: 1,
                      maxLines: 4,
                      onChanged: (_) => context.read<AppState>().sockets.typing(widget.conversationId, true),
                      decoration: const InputDecoration(hintText: 'Write a message...'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(onPressed: sendText, icon: const Icon(Icons.send)),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message, required this.mine, required this.color});
  final ChatMessage message;
  final bool mine;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final text = message.message.isNotEmpty ? message.message : message.text;
    final time = DateTime.tryParse(message.createdAt ?? '');
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * .78),
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: mine ? color : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(22).copyWith(bottomRight: mine ? const Radius.circular(4) : null, bottomLeft: mine ? null : const Radius.circular(4)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(.06), blurRadius: 12)],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          for (final a in message.attachments) _AttachmentView(attachment: a),
          if (text.isNotEmpty) Text(text, style: TextStyle(color: mine ? Colors.white : null, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(
            '${time == null ? '' : DateFormat('h:mm a').format(time)} ${mine ? (message.readAt != null ? 'Read ✓✓' : message.deliveredAt != null ? 'Delivered ✓✓' : 'Sent ✓') : ''}',
            style: TextStyle(fontSize: 11, color: mine ? Colors.white70 : Theme.of(context).hintColor),
          ),
        ]),
      ),
    );
  }
}

class _AttachmentView extends StatelessWidget {
  const _AttachmentView({required this.attachment});
  final Map<String, dynamic> attachment;

  @override
  Widget build(BuildContext context) {
    final url = ApiClient.instance.absoluteUrl('${attachment['url'] ?? attachment['fileUrl'] ?? attachment['imageUrl'] ?? ''}');
    final type = '${attachment['mimeType'] ?? attachment['type'] ?? ''}';
    if (url.isNotEmpty && type.startsWith('image')) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: ClipRRect(borderRadius: BorderRadius.circular(16), child: Image.network(url, fit: BoxFit.cover)),
      );
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: Colors.white.withOpacity(.18), borderRadius: BorderRadius.circular(14)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.insert_drive_file_outlined),
        const SizedBox(width: 8),
        Flexible(child: Text('${attachment['originalName'] ?? attachment['filename'] ?? 'Media file'}')),
      ]),
    );
  }
}
