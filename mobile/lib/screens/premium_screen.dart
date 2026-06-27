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
      final boost = sub?['nextBoostAt'] ?? sub?['subscription']?['nextBoostAt'];
      nextBoostAt = boost == null ? null : DateTime.tryParse('$boost');
    } catch (_) {}
    if (mounted) setState(() {});
  }

  bool get canBoost => nextBoostAt == null || DateTime.now().isAfter(nextBoostAt!);
  String get boostLabel {
    if (canBoost) return 'Boost profile';
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
            subtitle: const Text('Boost can be used once every 30 minutes.'),
            trailing: FilledButton(
              onPressed: canBoost
                  ? () async {
                      await context.read<AppState>().boost();
                      nextBoostAt = DateTime.now().add(const Duration(minutes: 30));
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
