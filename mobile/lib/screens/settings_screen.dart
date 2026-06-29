import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_theme.dart';
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
              const Text('Choose theme', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              const Text('Your selection is saved on this device.'),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: SegmentedButton<CyberTheme>(
                  segments: const [
                    ButtonSegment(value: CyberTheme.blossom, icon: Icon(Icons.auto_awesome), label: Text('Blossom')),
                    ButtonSegment(value: CyberTheme.sunset, icon: Icon(Icons.wb_sunny_outlined), label: Text('Sunset')),
                    ButtonSegment(value: CyberTheme.ivory, icon: Icon(Icons.favorite_outline), label: Text('Ivory')),
                  ],
                  selected: {app.selectedTheme},
                  showSelectedIcon: false,
                  onSelectionChanged: (selection) => app.setTheme(selection.first),
                ),
              ),
            ]),
          ),
        ),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Appearance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              RadioListTile(value: ThemeMode.system, groupValue: app.appearanceMode, onChanged: (value) => app.setAppearance(value!), title: const Text('System mode')),
              RadioListTile(value: ThemeMode.light, groupValue: app.appearanceMode, onChanged: (value) => app.setAppearance(value!), title: const Text('Light mode')),
              RadioListTile(value: ThemeMode.dark, groupValue: app.appearanceMode, onChanged: (value) => app.setAppearance(value!), title: const Text('Dark mode')),
            ]),
          ),
        ),
        Card(child: SwitchListTile(value: app.showOnlineStatus, onChanged: app.setShowOnlineStatus, title: const Text('Show online status'), subtitle: const Text('Let matches see when you are online.'))),
        Card(child: SwitchListTile(value: app.readReceipts, onChanged: app.setReadReceipts, title: const Text('Read receipts'), subtitle: const Text('Show when messages are read.'))),
        Card(child: SwitchListTile(value: app.verifiedOnlyBrowsing, onChanged: app.setVerifiedOnlyBrowsing, title: const Text('Verified-only browsing'), subtitle: const Text('Only show verified profiles in Discovery.'))),
        const SizedBox(height: 18),
        OutlinedButton.icon(onPressed: () => app.logout(), icon: const Icon(Icons.logout), label: const Text('Log out')),
      ],
    );
  }
}
