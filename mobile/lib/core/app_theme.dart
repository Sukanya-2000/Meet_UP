import 'package:flutter/material.dart';

enum CyberTheme { blossom, sunset, ivory }

class AppTheme {
  static const coral = Color(0xFFFF6F68);
  static const rose = Color(0xFFFF4778);
  static const orange = Color(0xFFFF8C3A);
  static const ink = Color(0xFF162033);
  static const cream = Color(0xFFFFF7F0);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: cream,
        colorScheme: ColorScheme.fromSeed(seedColor: coral, brightness: Brightness.light),
        textTheme: Typography.blackCupertino.apply(fontFamily: 'Roboto', bodyColor: ink, displayColor: ink),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: Color(0xFFFFD2C8))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: Color(0xFFFFD2C8))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: coral, width: 1.4)),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF100819),
        colorScheme: ColorScheme.fromSeed(seedColor: rose, brightness: Brightness.dark),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white10,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: Colors.white24)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: Colors.white24)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: rose, width: 1.4)),
        ),
      );

  static ThemeData forStyle(CyberTheme style, {Brightness brightness = Brightness.light}) {
    final seed = switch (style) {
      CyberTheme.blossom => const Color(0xFF9B5DE5),
      CyberTheme.sunset => coral,
      CyberTheme.ivory => const Color(0xFFE76F51),
    };
    final background = brightness == Brightness.dark
        ? switch (style) {
            CyberTheme.blossom => const Color(0xFF150A1F),
            CyberTheme.sunset => const Color(0xFF1D0E0C),
            CyberTheme.ivory => const Color(0xFF191512),
          }
        : switch (style) {
            CyberTheme.blossom => const Color(0xFFFFF9FE),
            CyberTheme.sunset => const Color(0xFFFFF6ED),
            CyberTheme.ivory => const Color(0xFFFFFCF8),
          };
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(seedColor: seed, brightness: brightness),
      textTheme: ThemeData(brightness: brightness).textTheme.copyWith(
        displaySmall: TextStyle(fontSize: 32, height: 1.08, fontWeight: FontWeight.w800, color: brightness == Brightness.dark ? Colors.white : ink),
      ),
      cardTheme: CardThemeData(color: brightness == Brightness.dark ? const Color(0xFF281D20) : Colors.white.withValues(alpha: .94), elevation: 1),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: brightness == Brightness.dark ? Colors.white10 : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: BorderSide(color: seed.withValues(alpha: .25))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: BorderSide(color: seed.withValues(alpha: .25))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: BorderSide(color: seed, width: 1.4)),
      ),
    );
  }

  static BoxDecoration pageGradient(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    final background = Theme.of(context).scaffoldBackgroundColor;
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [background, Color.alphaBlend(primary.withValues(alpha: .08), background), background],
      ),
    );
  }

  static LinearGradient get brandGradient => const LinearGradient(colors: [rose, coral, orange]);
}
