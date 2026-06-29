import 'package:flutter/material.dart';

import '../core/app_theme.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.small = false});
  final bool small;
  @override
  Widget build(BuildContext context) {
    final size = small ? 34.0 : 48.0;
    return Row(mainAxisSize: MainAxisSize.min, children: [
      ClipRRect(
        borderRadius: BorderRadius.circular(small ? 11 : 16),
        child: ColorFiltered(
          colorFilter: ColorFilter.mode(Theme.of(context).colorScheme.primary.withValues(alpha: .28), BlendMode.color),
          child: Image.asset('assets/branding/cybernest-icon.png', width: size, height: size, fit: BoxFit.cover),
        ),
      ),
      const SizedBox(width: 10),
      Text('MeetUp', style: TextStyle(fontSize: small ? 20 : 24, fontWeight: FontWeight.w800)),
    ]);
  }
}

class GradientButton extends StatelessWidget {
  const GradientButton({super.key, required this.label, required this.onTap, this.icon, this.enabled = true});
  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final bool enabled;
  @override
  Widget build(BuildContext context) => Opacity(
        opacity: enabled ? 1 : .55,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(22),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 18),
            decoration: BoxDecoration(gradient: AppTheme.brandGradient, borderRadius: BorderRadius.circular(22), boxShadow: [BoxShadow(color: AppTheme.coral.withValues(alpha: .22), blurRadius: 24)]),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [if (icon != null) Icon(icon, color: Colors.white), if (icon != null) const SizedBox(width: 8), Text(label, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800))]),
          ),
        ),
      );
}

class SoftCard extends StatelessWidget {
  const SoftCard({super.key, required this.child, this.padding = const EdgeInsets.all(18)});
  final Widget child;
  final EdgeInsets padding;
  @override
  Widget build(BuildContext context) => Container(
        padding: padding,
        decoration: BoxDecoration(color: Theme.of(context).cardColor.withValues(alpha: .94), borderRadius: BorderRadius.circular(28), border: Border.all(color: AppTheme.coral.withValues(alpha: .22)), boxShadow: [BoxShadow(color: AppTheme.coral.withValues(alpha: .12), blurRadius: 30)]),
        child: child,
      );
}
