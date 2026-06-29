import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/app_theme.dart';
import 'providers/app_state.dart';
import 'screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CyberNestApp());
}

class CyberNestApp extends StatelessWidget {
  const CyberNestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..bootstrap(),
      child: Consumer<AppState>(
        builder: (context, app, _) => MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'MeetUp',
          themeMode: app.appearanceMode,
          theme: AppTheme.forStyle(app.selectedTheme),
          darkTheme: AppTheme.forStyle(app.selectedTheme, brightness: Brightness.dark),
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
