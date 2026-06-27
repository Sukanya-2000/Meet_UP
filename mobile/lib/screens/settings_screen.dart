import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text('Settings', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Appearance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              RadioListTile(value: ThemeMode.system, groupValue: app.themeMode, onChanged: (v) => app.setTheme(v!), title: const Text('System mode')),
              RadioListTile(value: ThemeMode.light, groupValue: app.themeMode, onChanged: (v) => app.setTheme(v!), title: const Text('Light mode')),
              RadioListTile(value: ThemeMode.dark, groupValue: app.themeMode, onChanged: (v) => app.setTheme(v!), title: const Text('Dark mode')),
            ]),
          ),
        ),
        const Card(child: SwitchListTile(value: true, onChanged: null, title: Text('Show online status'), subtitle: Text('Let matches see when you are online.'))),
        const Card(child: SwitchListTile(value: true, onChanged: null, title: Text('Read receipts'), subtitle: Text('Show when messages are read.'))),
        const Card(child: SwitchListTile(value: false, onChanged: null, title: Text('Verified-only browsing'), subtitle: Text('Premium safety filter.'))),
        const SizedBox(height: 18),
        OutlinedButton.icon(onPressed: () => app.logout(), icon: const Icon(Icons.logout), label: const Text('Log out')),
      ],
    );
  }
}
