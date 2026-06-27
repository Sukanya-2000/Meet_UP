import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../widgets/brand.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool signup = false;
  String? error;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Scaffold(
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(24), children: [
          const SizedBox(height: 40),
          const Center(child: BrandLogo()),
          const SizedBox(height: 32),
          Text(signup ? 'Create your nest' : 'Welcome back', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          Text('Connect. Share. Belong.', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
          const SizedBox(height: 28),
          TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email address')),
          const SizedBox(height: 14),
          TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
          if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: const TextStyle(color: Colors.red))),
          const SizedBox(height: 20),
          GradientButton(
            label: signup ? 'Create account' : 'Log in',
            icon: Icons.arrow_forward,
            onTap: () async {
              final msg = signup ? await app.register(email.text, password.text) : await app.login(email.text, password.text);
              if (mounted) setState(() => error = msg);
            },
          ),
          TextButton(onPressed: () => setState(() => signup = !signup), child: Text(signup ? 'Already have an account? Log in' : 'New here? Create account')),
          TextButton(onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Use the web app forgot-password flow for now.'))), child: const Text('Forgot password?')),
        ]),
      ),
    );
  }
}
