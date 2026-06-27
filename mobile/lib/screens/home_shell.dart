import 'package:flutter/material.dart';

import '../core/app_theme.dart';
import '../widgets/brand.dart';
import 'connections_screen.dart';
import 'discover_screen.dart';
import 'liked_you_screen.dart';
import 'premium_screen.dart';
import 'profile_screen.dart';
import 'requests_screen.dart';
import 'settings_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int index = 0;
  final screens = const [DiscoverScreen(), RequestsScreen(), ConnectionsScreen(), LikedYouScreen(), PremiumScreen(), ProfileScreen(), SettingsScreen()];
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.pageGradient(context),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(backgroundColor: Theme.of(context).cardColor.withOpacity(.78), title: const BrandLogo(small: true), elevation: 0),
        body: screens[index],
        bottomNavigationBar: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (value) => setState(() => index = value),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.explore_outlined), label: 'Discover'),
            NavigationDestination(icon: Icon(Icons.group_add_outlined), label: 'Requests'),
            NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chats'),
            NavigationDestination(icon: Icon(Icons.favorite_border), label: 'Likes'),
            NavigationDestination(icon: Icon(Icons.workspace_premium_outlined), label: 'Premium'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings'),
          ],
        ),
      ),
    );
  }
}
