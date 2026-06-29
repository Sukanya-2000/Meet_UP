import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/app_theme.dart';
import '../providers/app_state.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});
  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  Map<String, dynamic>? sub;
  DateTime? nextBoostAt;
  int boostsRemaining = 0;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    load();
    timer = Timer.periodic(const Duration(seconds: 1), (_) => mounted ? setState(() {}) : null);
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> load() async {
    try {
      sub = await context.read<AppState>().subscription();
      final boost = sub?['boostedUntil'] ?? sub?['nextBoostAt'] ?? sub?['subscription']?['boostedUntil'] ?? sub?['subscription']?['nextBoostAt'];
      nextBoostAt = boost == null ? null : DateTime.tryParse('$boost');
      final remaining = sub?['boostsRemaining'] ?? sub?['subscription']?['boostsRemaining'];
      boostsRemaining = remaining is num ? remaining.toInt() : 0;
    } catch (_) {}
    if (mounted) setState(() {});
  }

  bool get boostActive => nextBoostAt != null && DateTime.now().isBefore(nextBoostAt!);
  bool get canBoost => boostsRemaining > 0 && !boostActive;
  String get boostLabel {
    if (boostsRemaining <= 0) return '0 boosts left';
    if (!boostActive) return 'Boost profile';
    final left = nextBoostAt!.difference(DateTime.now());
    final mm = left.inMinutes.remainder(60).toString().padLeft(2, '0');
    final ss = left.inSeconds.remainder(60).toString().padLeft(2, '0');
    return 'Boost again in $mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    final active = sub?['active'] == true || sub?['subscription']?['status'] == 'active';
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text('Premium', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(gradient: AppTheme.brandGradient, borderRadius: BorderRadius.circular(28)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(active ? 'CyberNest Premium is active' : 'Unlock more sparks', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 10),
            const Text('Likes You • Unlimited Likes • Advanced Filters • Boosts', style: TextStyle(color: Colors.white)),
            const SizedBox(height: 18),
            FilledButton.tonal(
              onPressed: active
                  ? null
                  : () async {
                      final res = await context.read<AppState>().premiumCheckout();
                      final url = Uri.tryParse('${res['url'] ?? res['checkoutUrl'] ?? ''}');
                      if (url != null) await launchUrl(url, mode: LaunchMode.externalApplication);
                      await load();
                    },
              child: Text(active ? 'Subscribed' : 'Subscribe'),
            ),
          ]),
        ),
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            leading: const Icon(Icons.bolt),
            title: Text(boostLabel),
            subtitle: Text('$boostsRemaining boosts remaining${boostActive ? ' • Profile currently boosted' : ''}'),
            trailing: FilledButton(
              onPressed: canBoost
                  ? () async {
                      final result = await context.read<AppState>().boost();
                      final remaining = result['boostsRemaining'];
                      boostsRemaining = remaining is num ? remaining.toInt() : boostsRemaining - 1;
                      nextBoostAt = DateTime.tryParse('${result['boostedUntil'] ?? ''}');
                      setState(() {});
                    }
                  : null,
              child: const Text('Boost'),
            ),
          ),
        ),
      ],
    );
  }
}
