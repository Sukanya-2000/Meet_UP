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
          theme: AppTheme.forStyle(app.selectedTheme, accent: app.accentColor, highContrast: app.highContrast),
          darkTheme: AppTheme.forStyle(app.selectedTheme, brightness: Brightness.dark, accent: app.accentColor, highContrast: app.highContrast),
          builder: (context, child) => Directionality(
            textDirection: app.rtlPreview ? TextDirection.rtl : TextDirection.ltr,
            child: MediaQuery(data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(app.textScale), disableAnimations: app.reducedMotion), child: child!),
          ),
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
