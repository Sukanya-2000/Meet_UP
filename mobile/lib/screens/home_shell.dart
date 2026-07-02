import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_theme.dart';
import '../providers/app_state.dart';
import '../widgets/brand.dart';
import 'connections_screen.dart';
import 'community_screen.dart';
import 'discover_screen.dart';
import 'liked_you_screen.dart';
import 'premium_screen.dart';
import 'profile_screen.dart';
import 'requests_screen.dart';
import 'safety_screen.dart';
import 'settings_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int index = 0;
  final screens = const [DiscoverScreen(), CommunityScreen(), RequestsScreen(), ConnectionsScreen(), LikedYouScreen(), PremiumScreen(), ProfileScreen(), SafetyScreen(), SettingsScreen()];
  static const destinations = [
    (Icons.explore_outlined, 'Discover'),
    (Icons.groups_outlined, 'Community'),
    (Icons.group_add_outlined, 'Requests'),
    (Icons.chat_bubble_outline, 'Chats'),
    (Icons.favorite_border, 'Likes'),
    (Icons.workspace_premium_outlined, 'Premium'),
    (Icons.person_outline, 'Profile'),
    (Icons.shield_outlined, 'Safety Center'),
    (Icons.settings_outlined, 'Settings'),
  ];
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.pageGradient(context),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: Theme.of(context).cardColor.withValues(alpha: .78),
          title: const BrandLogo(small: true),
          elevation: 0,
          actions: [Builder(builder: (context) => IconButton(icon: const Icon(Icons.menu), tooltip: 'Open menu', onPressed: () => Scaffold.of(context).openEndDrawer()))],
        ),
        endDrawer: NavigationDrawer(
          selectedIndex: index,
          onDestinationSelected: (value) async {
            if (value == destinations.length) {
              Navigator.pop(context);
              await context.read<AppState>().logout();
              return;
            }
            setState(() => index = value);
            Navigator.pop(context);
          },
          children: [
            const Padding(padding: EdgeInsets.fromLTRB(24, 28, 16, 14), child: BrandLogo()),
            const Divider(),
            for (final destination in destinations) NavigationDrawerDestination(icon: Icon(destination.$1), label: Text(destination.$2)),
            const Divider(),
            const NavigationDrawerDestination(icon: Icon(Icons.logout), label: Text('Logout')),
          ],
        ),
        body: screens[index],
      ),
    );
  }
}
