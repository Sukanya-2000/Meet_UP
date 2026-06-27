import 'package:flutter/material.dart';

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

  static BoxDecoration pageGradient(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: dark
            ? const [Color(0xFF100819), Color(0xFF211229), Color(0xFF32152E)]
            : const [Color(0xFFFFFAF3), Color(0xFFFFF1ED), Color(0xFFFFF7ED)],
      ),
    );
  }

  static LinearGradient get brandGradient => const LinearGradient(colors: [rose, coral, orange]);
}
