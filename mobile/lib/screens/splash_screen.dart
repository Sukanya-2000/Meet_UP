import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_theme.dart';
import '../providers/app_state.dart';
import 'auth_screen.dart';
import 'home_shell.dart';
import '../widgets/brand.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    if (!app.booted) {
      return Container(decoration: AppTheme.pageGradient(context), child: const Center(child: BrandLogo()));
    }
    return app.loggedIn ? const HomeShell() : const AuthScreen();
  }
}

