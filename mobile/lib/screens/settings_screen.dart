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
              SegmentedButton<ThemeMode>(segments: const [ButtonSegment(value: ThemeMode.system, label: Text('System')), ButtonSegment(value: ThemeMode.light, label: Text('Light')), ButtonSegment(value: ThemeMode.dark, label: Text('Dark'))], selected: {app.appearanceMode}, onSelectionChanged: (value) => app.setAppearance(value.first)),
              ListTile(title: const Text('Accent color'), trailing: DropdownButton<String>(value: app.accentColor, items: ['coral','rose','violet','blue','emerald','amber'].map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(), onChanged: (value) { if (value != null) app.updateAppearance(accent: value); })),
              ListTile(title: const Text('Font size'), trailing: DropdownButton<String>(value: app.fontSize, items: ['small','medium','large'].map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(), onChanged: (value) { if (value != null) app.updateAppearance(size: value); })),
              Text('Text scaling: ${(app.textScale * 100).round()}%'),
              Slider(value: app.textScale, min: .8, max: 1.5, divisions: 7, onChanged: (value) => app.updateAppearance(scale: value)),
              SwitchListTile(value: app.reducedMotion, onChanged: (value) => app.updateAppearance(motion: value), title: const Text('Reduced motion')),
              SwitchListTile(value: app.highContrast, onChanged: (value) => app.updateAppearance(contrast: value), title: const Text('High contrast')),
              SwitchListTile(value: app.rtlPreview, onChanged: (value) => app.updateAppearance(rtl: value), title: const Text('RTL preview')),
            ]),
          ),
        ),
        Card(child: SwitchListTile(value: app.showOnlineStatus, onChanged: app.setShowOnlineStatus, title: const Text('Show online status'), subtitle: const Text('Let matches see when you are online.'))),
        Card(child: SwitchListTile(value: app.readReceipts, onChanged: app.setReadReceipts, title: const Text('Read receipts'), subtitle: const Text('Show when messages are read.'))),
        Card(child: SwitchListTile(value: app.verifiedOnlyBrowsing, onChanged: app.setVerifiedOnlyBrowsing, title: const Text('Verified-only browsing'), subtitle: const Text('Only show verified profiles in Discovery.'))),
        Card(child: ListTile(title: const Text('Language'), trailing: DropdownButton<String>(value: app.localeCode, items: const [DropdownMenuItem(value: 'en', child: Text('English')), DropdownMenuItem(value: 'es', child: Text('Español')), DropdownMenuItem(value: 'hi', child: Text('हिन्दी')), DropdownMenuItem(value: 'ar', child: Text('العربية'))], onChanged: (value) { if (value != null) app.setLocaleCode(value); }))),
        Card(child: ListTile(title: const Text('Privacy Center'), subtitle: const Text('Export your account or manage consent'), trailing: const Icon(Icons.privacy_tip_outlined), onTap: () async { await app.exportAccount(); if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account export prepared'))); })),
        Card(child: ListTile(title: const Text('AI profile suggestions'), trailing: const Icon(Icons.auto_awesome), onTap: () async { final result = await app.aiProfile('improve'); if (context.mounted) showDialog(context: context, builder: (_) => AlertDialog(title: const Text('Profile suggestions'), content: SingleChildScrollView(child: Text('${result['result']?['suggestions'] ?? result}')))); })),
        Card(child: ListTile(title: const Text('Opening Moves'), subtitle: const Text('Add a conversation starter'), trailing: const Icon(Icons.add_comment_outlined), onTap: () async { final controller = TextEditingController(); final text = await showDialog<String>(context: context, builder: (context) => AlertDialog(title: const Text('New Opening Move'), content: TextField(controller: controller, maxLength: 300, decoration: const InputDecoration(hintText: 'Ask something inviting…')), actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')), FilledButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('Save'))])); if (text != null && text.trim().isNotEmpty) await app.createOpeningMove({'type': 'question', 'content': text.trim(), 'orderIndex': 0}); })),
        Card(child: ListTile(title: const Text('Snooze Mode'), subtitle: const Text('Hide your profile and pause discovery for 24 hours'), trailing: const Icon(Icons.pause_circle_outline), onTap: () => app.setSnooze(true, hours: 24, reason: 'Taking a break'))),
        const SizedBox(height: 18),
        OutlinedButton.icon(onPressed: () => app.logout(), icon: const Icon(Icons.logout), label: const Text('Log out')),
      ],
    );
  }
}
