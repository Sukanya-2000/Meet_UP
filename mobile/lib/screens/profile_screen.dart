import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../widgets/brand.dart';

const interests = ['Coffee', 'Travel', 'Fitness', 'Movies', 'Music', 'Books', 'Photography', 'Gaming'];

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final firstName = TextEditingController();
  final city = TextEditingController();
  final bio = TextEditingController();
  String gender = 'woman';
  String lookingFor = 'everyone';
  final selected = <String>{};
  String? message;

  @override
  void initState() {
    super.initState();
    Future.microtask(load);
  }

  Future<void> load() async {
    final data = await context.read<AppState>().myProfile();
    final profile = data['profile'];
    if (profile is Map) {
      setState(() {
        firstName.text = '${profile['firstName'] ?? ''}';
        city.text = '${profile['city'] ?? ''}';
        bio.text = '${profile['bio'] ?? ''}';
        gender = '${profile['gender'] ?? 'woman'}';
        lookingFor = '${profile['lookingFor'] ?? 'everyone'}';
        selected.addAll((profile['interests'] as List? ?? []).map((e) => '$e'));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    return ListView(padding: const EdgeInsets.all(20), children: [
      Text('Edit profile', style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w900)),
      const SizedBox(height: 16),
      TextField(controller: firstName, decoration: const InputDecoration(labelText: 'First name')),
      const SizedBox(height: 12),
      TextField(controller: city, decoration: const InputDecoration(labelText: 'City')),
      const SizedBox(height: 12),
      TextField(controller: bio, maxLines: 4, decoration: const InputDecoration(labelText: 'Bio')),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: DropdownButtonFormField(initialValue: gender, decoration: const InputDecoration(labelText: 'Gender'), items: ['man', 'woman', 'non-binary', 'other'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => setState(() => gender = v!))),
        const SizedBox(width: 12),
        Expanded(child: DropdownButtonFormField(initialValue: lookingFor, decoration: const InputDecoration(labelText: 'Looking for'), items: ['man', 'woman', 'everyone'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(), onChanged: (v) => setState(() => lookingFor = v!))),
      ]),
      const SizedBox(height: 18),
      Wrap(spacing: 8, runSpacing: 8, children: interests.map((i) => FilterChip(label: Text(i), selected: selected.contains(i), onSelected: (_) => setState(() => selected.contains(i) ? selected.remove(i) : selected.add(i)))).toList()),
      const SizedBox(height: 20),
      GradientButton(label: 'Save profile', icon: Icons.save, onTap: () async {
        await app.updateProfile({'firstName': firstName.text, 'city': city.text, 'bio': bio.text, 'gender': gender, 'lookingFor': lookingFor, 'interests': selected.toList()});
        setState(() => message = 'Profile saved');
      }),
      const SizedBox(height: 12),
      OutlinedButton.icon(onPressed: () async {
        final image = await ImagePicker().pickImage(source: ImageSource.gallery);
        if (image == null) return;
        await app.api.upload('/photos/upload', {}, [File(image.path)], fieldName: 'photos');
        setState(() => message = 'Photo uploaded');
      }, icon: const Icon(Icons.photo), label: const Text('Upload profile photo')),
      if (message != null) Padding(padding: const EdgeInsets.all(12), child: Text(message!)),
      const Divider(height: 32),
      OutlinedButton.icon(onPressed: () => app.logout(), icon: const Icon(Icons.logout), label: const Text('Log out')),
    ]);
  }
}
