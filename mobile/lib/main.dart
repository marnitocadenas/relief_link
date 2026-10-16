import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const ink = Color(0xFF173B35);
const green = Color(0xFF16856A);
const canvas = Color(0xFFF5F7F4);

void main() => runApp(const ReliefLinkApp());

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class Api {
  static String base =
      defaultTargetPlatform == TargetPlatform.windows ||
          defaultTargetPlatform == TargetPlatform.iOS
      ? 'http://127.0.0.1:8000/api'
      : 'http://10.0.2.2:8000/api';
  static String? token;

  static Future<dynamic> call(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('${base.replaceAll(RegExp(r'/+$'), '')}/$path');
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    final request = http.Request(method, uri)..headers.addAll(headers);
    if (body != null) request.body = jsonEncode(body);
    try {
      final streamed = await request.send().timeout(
        const Duration(seconds: 20),
      );
      final response = await http.Response.fromStream(streamed);
      dynamic data;
      try {
        data = response.body.isEmpty ? null : jsonDecode(response.body);
      } catch (_) {
        data = response.body;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final errors = data is Map ? data['errors'] : null;
        final message = data is Map
            ? (_firstError(errors) ?? data['message'])
            : null;
        throw ApiException(
          '$message' == 'null'
              ? 'Request failed (${response.statusCode}).'
              : '$message',
        );
      }
      return data;
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException(
        'Could not reach the ReliefLink server. Check the API URL and connection.',
      );
    }
  }

  static String? _firstError(dynamic errors) {
    if (errors is Map && errors.isNotEmpty) {
      final value = errors.values.first;
      if (value is List && value.isNotEmpty) return '${value.first}';
    }
    return null;
  }

  static Future<List<Map<String, dynamic>>> list(String path) async {
    final result = await call(path);
    if (result is List)
      return result.map((e) => Map<String, dynamic>.from(e)).toList();
    if (result is Map && result['data'] is List) {
      return (result['data'] as List)
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    return [];
  }
}

class ReliefLinkApp extends StatefulWidget {
  const ReliefLinkApp({super.key});
  @override
  State<ReliefLinkApp> createState() => _ReliefLinkAppState();
}

class _ReliefLinkAppState extends State<ReliefLinkApp> {
  Map<String, dynamic>? user;
  bool checking = true;

  @override
  void initState() {
    super.initState();
    restore();
  }

  Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    Api.base = prefs.getString('api_base') ?? Api.base;
    Api.token = prefs.getString('token');
    if (Api.token != null) {
      try {
        final data = await Api.call('user');
        user = Map<String, dynamic>.from(data['data'] ?? data);
      } catch (_) {
        await prefs.remove('token');
        Api.token = null;
      }
    }
    if (mounted) setState(() => checking = false);
  }

  Future<void> signedIn(Map<String, dynamic> data, String newToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', newToken);
    Api.token = newToken;
    if (mounted) setState(() => user = data);
  }

  Future<void> signOut() async {
    try {
      await Api.call('logout', method: 'POST');
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    Api.token = null;
    if (mounted) setState(() => user = null);
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'ReliefLink',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: canvas,
      colorScheme: ColorScheme.fromSeed(
        seedColor: green,
        primary: green,
        surface: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: canvas,
        foregroundColor: ink,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 15,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    ),
    home: checking
        ? const Scaffold(body: Center(child: CircularProgressIndicator()))
        : user == null
        ? AuthPage(onSignedIn: signedIn)
        : HomePage(user: user!, onSignOut: signOut),
  );
}

class AuthPage extends StatefulWidget {
  const AuthPage({super.key, required this.onSignedIn});
  final Future<void> Function(Map<String, dynamic>, String) onSignedIn;
  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  bool registering = false, busy = false, obscure = true;
  String role = 'beneficiary';
  final form = GlobalKey<FormState>();
  final name = TextEditingController(),
      email = TextEditingController(),
      phone = TextEditingController(),
      password = TextEditingController();
  final studentId = TextEditingController(),
      department = TextEditingController(),
      course = TextEditingController(),
      year = TextEditingController();
  final campusId = TextEditingController(),
      address = TextEditingController(),
      validId = TextEditingController();
  String beneficiaryType = 'student';
  String validIdType = 'National ID';
  static const departments = [
    'College of Teacher Education',
    'College of Arts and Sciences',
    'College of Criminal Justice Education',
    'College of Computer Studies',
    'College of Office Administration',
  ];
  static const coursesByDepartment = {
    'College of Teacher Education': [
      'Bachelor of Elementary Education',
      'Bachelor of Secondary Education',
    ],
    'College of Arts and Sciences': [
      'Bachelor of Arts in Political Science',
      'Bachelor of Arts in Communication',
    ],
    'College of Criminal Justice Education': [
      'Bachelor of Science in Criminology',
    ],
    'College of Computer Studies': [
      'Bachelor of Science in Information Technology',
    ],
    'College of Office Administration': [
      'Bachelor of Science in Office Administration',
    ],
  };

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    phone.dispose();
    password.dispose();
    studentId.dispose();
    department.dispose();
    course.dispose();
    year.dispose();
    campusId.dispose();
    address.dispose();
    validId.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (!(form.currentState?.validate() ?? false)) return;
    setState(() => busy = true);
    try {
      dynamic result;
      if (registering) {
        final names = name.text.trim().split(RegExp(r'\s+'));
        final body = <String, dynamic>{
          'role': role,
          'account_type': role,
          'first_name': names.first,
          'middle_name': names.length > 2
              ? names.sublist(1, names.length - 1).join(' ')
              : null,
          'last_name': names.length > 1 ? names.last : '',
          'name': name.text.trim(),
          'email': email.text.trim(),
          'contact_number': phone.text.trim(),
          'password': password.text,
          'password_confirmation': password.text,
          'country': 'Philippines',
          'country_code': 'PH',
        };
        if (role == 'donor') {
          body.addAll({
            'address_line_1': address.text.trim(),
            'valid_id_type': validIdType,
            'valid_id_number': validId.text.trim(),
          });
        } else {
          body.addAll({'beneficiary_type': beneficiaryType});
          if (beneficiaryType == 'student')
            body.addAll({
              'department': department.text,
              'student_id_number': studentId.text.trim(),
              'course': course.text,
              'year_level': year.text,
            });
          else
            body.addAll({
              'campus_id': campusId.text.trim(),
              'department': department.text.trim(),
            });
        }
        result = await Api.call('register', method: 'POST', body: body);
      } else {
        result = await Api.call(
          'login',
          method: 'POST',
          body: {'email': email.text.trim(), 'password': password.text},
        );
      }
      await widget.onSignedIn(
        Map<String, dynamic>.from(result['user']),
        result['token'],
      );
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Widget field(
    String label,
    TextEditingController controller, {
    bool secret = false,
    String? hint,
    TextInputType? keyboard,
    String? Function(String?)? validator,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: TextFormField(
      controller: controller,
      obscureText: secret && obscure,
      keyboardType: keyboard,
      validator:
          validator ??
          (v) => (v == null || v.trim().isEmpty) ? '$label is required.' : null,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        suffixIcon: secret
            ? IconButton(
                icon: Icon(
                  obscure
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                ),
                onPressed: () => setState(() => obscure = !obscure),
              )
            : null,
      ),
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Form(
              key: form,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: green,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(
                      Icons.volunteer_activism,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  const SizedBox(height: 22),
                  Text(
                    registering ? 'Join ReliefLink' : 'Welcome back',
                    style: const TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: ink,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    registering
                        ? 'Connect with a community ready to help.'
                        : 'Sign in to continue supporting your community.',
                    style: const TextStyle(color: Colors.black54),
                  ),
                  const SizedBox(height: 25),
                  if (registering) ...[
                    const Text(
                      'I want to',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(
                          value: 'beneficiary',
                          label: Text('Get support'),
                          icon: Icon(Icons.volunteer_activism),
                        ),
                        ButtonSegment(
                          value: 'donor',
                          label: Text('Donate'),
                          icon: Icon(Icons.favorite_border),
                        ),
                      ],
                      selected: {role},
                      onSelectionChanged: (v) => setState(() => role = v.first),
                    ),
                    const SizedBox(height: 16),
                    field('Full name', name),
                  ],
                  field(
                    'Email address',
                    email,
                    keyboard: TextInputType.emailAddress,
                    validator: (v) => v == null || !v.contains('@')
                        ? 'Enter a valid email address.'
                        : null,
                  ),
                  if (registering) ...[
                    field(
                      'Philippine mobile number',
                      phone,
                      keyboard: TextInputType.phone,
                      hint: '09XXXXXXXXX',
                      validator: (v) =>
                          v == null || !RegExp(r'^09\d{9}$').hasMatch(v.trim())
                          ? 'Enter a valid mobile number (09XXXXXXXXX).'
                          : null,
                    ),
                    if (role == 'beneficiary') ...[
                      DropdownButtonFormField<String>(
                        value: beneficiaryType,
                        decoration: const InputDecoration(
                          labelText: 'Account type',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'student',
                            child: Text('Student'),
                          ),
                          DropdownMenuItem(
                            value: 'faculty',
                            child: Text('Faculty'),
                          ),
                          DropdownMenuItem(
                            value: 'staff',
                            child: Text('Staff'),
                          ),
                        ],
                        onChanged: (v) =>
                            setState(() => beneficiaryType = v ?? 'student'),
                      ),
                      const SizedBox(height: 12),
                      if (beneficiaryType == 'student') ...[
                        DropdownButtonFormField<String>(
                          value: departments.contains(department.text)
                              ? department.text
                              : null,
                          decoration: const InputDecoration(
                            labelText: 'Department',
                          ),
                          items: departments
                              .map(
                                (v) => DropdownMenuItem(
                                  value: v,
                                  child: Text(
                                    v,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              )
                              .toList(),
                          onChanged: (v) => setState(() {
                            department.text = v ?? '';
                            course.text = '';
                          }),
                        ),
                        const SizedBox(height: 12),
                        field(
                          'Student ID (YY-######)',
                          studentId,
                          hint: '21-010956',
                          validator: (v) =>
                              v == null ||
                                  !RegExp(r'^\d{2}-\d{6}$').hasMatch(v.trim())
                              ? 'Use the format YY-######.'
                              : null,
                        ),
                        DropdownButtonFormField<String>(
                          value:
                              (coursesByDepartment[department.text] ?? [])
                                  .contains(course.text)
                              ? course.text
                              : null,
                          decoration: const InputDecoration(
                            labelText: 'Course',
                          ),
                          items:
                              (coursesByDepartment[department.text] ??
                                      const <String>[])
                                  .map(
                                    (v) => DropdownMenuItem(
                                      value: v,
                                      child: Text(
                                        v,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  )
                                  .toList(),
                          onChanged: (v) =>
                              setState(() => course.text = v ?? ''),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value:
                              [
                                '1st Year',
                                '2nd Year',
                                '3rd Year',
                                '4th Year',
                              ].contains(year.text)
                              ? year.text
                              : null,
                          decoration: const InputDecoration(
                            labelText: 'Year level',
                          ),
                          items:
                              ['1st Year', '2nd Year', '3rd Year', '4th Year']
                                  .map(
                                    (v) => DropdownMenuItem(
                                      value: v,
                                      child: Text(v),
                                    ),
                                  )
                                  .toList(),
                          onChanged: (v) => year.text = v ?? '',
                        ),
                      ] else ...[
                        field('Campus ID', campusId),
                        field('Department', department),
                      ],
                    ] else ...[
                      field('Address', address),
                      DropdownButtonFormField<String>(
                        value: validIdType,
                        decoration: const InputDecoration(
                          labelText: 'Valid ID type',
                        ),
                        items:
                            [
                                  'National ID',
                                  'Driver’s License',
                                  'Passport',
                                  'Voter’s ID',
                                  'Other',
                                ]
                                .map(
                                  (v) => DropdownMenuItem(
                                    value: v,
                                    child: Text(v),
                                  ),
                                )
                                .toList(),
                        onChanged: (v) => validIdType = v ?? 'Other',
                      ),
                      const SizedBox(height: 12),
                      field('Valid ID number', validId),
                    ],
                  ],
                  field(
                    'Password',
                    password,
                    secret: true,
                    validator: (v) => (v == null || v.length < 8)
                        ? 'Password must be at least 8 characters.'
                        : null,
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: FilledButton(
                      onPressed: busy ? null : submit,
                      child: busy
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(registering ? 'Create account' : 'Sign in'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Center(
                    child: TextButton(
                      onPressed: () =>
                          setState(() => registering = !registering),
                      child: Text(
                        registering
                            ? 'Already have an account? Sign in'
                            : 'New to ReliefLink? Create an account',
                      ),
                    ),
                  ),
                  if (registering)
                    const Text(
                      'Password must include upper and lowercase letters, a number, and a symbol.',
                      style: TextStyle(color: Colors.black54, fontSize: 12),
                    ),
                  Center(
                    child: TextButton.icon(
                      onPressed: () => _serverDialog(context),
                      icon: const Icon(Icons.settings_ethernet, size: 18),
                      label: const Text('API server settings'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.user, required this.onSignOut});
  final Map<String, dynamic> user;
  final Future<void> Function() onSignOut;
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int tab = 0;
  void refresh() => setState(() {});
  @override
  Widget build(BuildContext context) {
    final donor = widget.user['role'] == 'donor';
    final pages = [
      DashboardPage(
        user: widget.user,
        donor: donor,
        onNavigate: (i) => setState(() => tab = i),
      ),
      donor ? const DonationPage() : const RequestPage(),
      const MatchesPage(),
      const NotificationsPage(),
    ];
    final titles = [
      'Home',
      donor ? 'My donations' : 'My requests',
      'Matches',
      'Updates',
    ];
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.volunteer_activism, color: green),
            const SizedBox(width: 8),
            Text(
              'ReliefLink · ${titles[tab]}',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const CircleAvatar(
              radius: 16,
              backgroundColor: Color(0xFFDCEEE7),
              child: Icon(Icons.person_outline, color: ink, size: 20),
            ),
            onSelected: (v) async {
              if (v == 'logout') await widget.onSignOut();
              if (v == 'server') await _serverDialog(context);
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'server',
                child: Text('API server settings'),
              ),
              PopupMenuItem(value: 'logout', child: Text('Sign out')),
            ],
          ),
        ],
      ),
      body: IndexedStack(index: tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(
              donor
                  ? Icons.volunteer_activism_outlined
                  : Icons.assignment_outlined,
            ),
            selectedIcon: Icon(
              donor ? Icons.volunteer_activism : Icons.assignment,
            ),
            label: donor ? 'Donations' : 'Requests',
          ),
          const NavigationDestination(
            icon: Icon(Icons.handshake_outlined),
            selectedIcon: Icon(Icons.handshake),
            label: 'Matches',
          ),
          const NavigationDestination(
            icon: Icon(Icons.notifications_none),
            selectedIcon: Icon(Icons.notifications),
            label: 'Updates',
          ),
        ],
      ),
    );
  }
}

Future<void> _serverDialog(BuildContext context) async {
  final controller = TextEditingController(text: Api.base);
  await showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('API server'),
      content: TextField(
        controller: controller,
        decoration: const InputDecoration(
          labelText: 'Base URL',
          hintText: 'http://192.168.1.10:8000/api',
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () async {
            Api.base = controller.text.trim();
            final p = await SharedPreferences.getInstance();
            await p.setString('api_base', Api.base);
            if (ctx.mounted) Navigator.pop(ctx);
          },
          child: const Text('Save'),
        ),
      ],
    ),
  );
  controller.dispose();
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({
    super.key,
    required this.user,
    required this.donor,
    required this.onNavigate,
  });
  final Map<String, dynamic> user;
  final bool donor;
  final ValueChanged<int> onNavigate;
  @override
  Widget build(
    BuildContext context,
  ) => FutureBuilder<List<List<Map<String, dynamic>>>>(
    future: Future.wait([
      Api.list(donor ? 'donations' : 'requests'),
      Api.list('matches'),
    ]),
    builder: (context, snap) {
      final records = snap.data?.first ?? [];
      final matches = snap.data?.last ?? [];
      return RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(milliseconds: 250));
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [ink, green],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, ${user['first_name'] ?? user['name'] ?? 'there'}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    donor
                        ? 'Your generosity helps neighbors get the essentials they need.'
                        : 'Your community is here to help. See your request progress anytime.',
                    style: const TextStyle(color: Colors.white70, height: 1.4),
                  ),
                  const SizedBox(height: 18),
                  FilledButton.tonalIcon(
                    onPressed: () => onNavigate(1),
                    icon: Icon(donor ? Icons.add : Icons.add_circle_outline),
                    label: Text(donor ? 'Make a donation' : 'Request support'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: _statCard(
                    'My ${donor ? 'donations' : 'requests'}',
                    '${records.length}',
                    Icons.inventory_2_outlined,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _statCard(
                    'Matches',
                    '${matches.length}',
                    Icons.handshake_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  donor ? 'Requests you can support' : 'Your latest requests',
                  style: const TextStyle(
                    fontSize: 18,
                    color: ink,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () => onNavigate(1),
                  child: const Text('View all'),
                ),
              ],
            ),
            _DashboardActivity(donor: donor, records: records),
          ],
        ),
      );
    },
  );
}

class _RecentRequests extends StatelessWidget {
  const _RecentRequests({required this.records});
  final List<Map<String, dynamic>> records;
  @override
  Widget build(BuildContext context) {
    if (records.isEmpty)
      return const EmptyCard(
        title: 'A little help can go a long way',
        text: 'Submit a support request and follow it here.',
      );
    return Column(
      children: records
          .take(3)
          .map((r) => RecordCard(record: r, isRequest: true))
          .toList(),
    );
  }
}

class _DashboardActivity extends StatelessWidget {
  const _DashboardActivity({required this.donor, required this.records});
  final bool donor;
  final List<Map<String, dynamic>> records;
  @override
  Widget build(BuildContext context) =>
      donor ? const _ApprovedRequests() : _RecentRequests(records: records);
}

Widget _statCard(String label, String value, IconData icon) => Card(
  child: Padding(
    padding: const EdgeInsets.all(17),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: green),
        const SizedBox(height: 14),
        Text(
          value,
          style: const TextStyle(
            fontSize: 25,
            fontWeight: FontWeight.bold,
            color: ink,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.black54)),
      ],
    ),
  ),
);

class _ApprovedRequests extends StatelessWidget {
  const _ApprovedRequests();
  @override
  Widget build(
    BuildContext context,
  ) => FutureBuilder<List<Map<String, dynamic>>>(
    future: Api.list('requests'),
    builder: (context, snap) {
      if (snap.connectionState == ConnectionState.waiting)
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: CircularProgressIndicator(),
          ),
        );
      final list = (snap.data ?? [])
          .where(
            (r) => ['approved', 'partially_fulfilled'].contains(r['status']),
          )
          .take(4)
          .toList();
      if (list.isEmpty)
        return const EmptyCard(
          title: 'Requests are being reviewed',
          text:
              'Verified requests will appear here when they are ready for support.',
        );
      return Column(
        children: list
            .map((r) => RecordCard(record: r, isRequest: true))
            .toList(),
      );
    },
  );
}

class DonationPage extends StatelessWidget {
  const DonationPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: canvas,
    body: FutureBuilder<List<Map<String, dynamic>>>(
      future: Api.list('donations'),
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting)
          return const Center(child: CircularProgressIndicator());
        if (snap.hasError)
          return ErrorState(error: snap.error.toString(), onRetry: () {});
        final records = snap.data ?? [];
        return RefreshIndicator(
          onRefresh: () async {},
          child: records.isEmpty
              ? ListView(
                  children: const [
                    SizedBox(height: 100),
                    EmptyCard(
                      title: 'Your donations start here',
                      text:
                          'Share useful items or contribute funds to support verified needs.',
                    ),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: records.map((r) => RecordCard(record: r)).toList(),
                ),
        );
      },
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: () => showDonationForm(context),
      icon: const Icon(Icons.add),
      label: const Text('Donate'),
    ),
  );
}

class RequestPage extends StatelessWidget {
  const RequestPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: canvas,
    body: FutureBuilder<List<Map<String, dynamic>>>(
      future: Api.list('requests'),
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting)
          return const Center(child: CircularProgressIndicator());
        if (snap.hasError)
          return ErrorState(error: snap.error.toString(), onRetry: () {});
        final records = snap.data ?? [];
        return RefreshIndicator(
          onRefresh: () async {},
          child: records.isEmpty
              ? ListView(
                  children: const [
                    SizedBox(height: 100),
                    EmptyCard(
                      title: 'No support requests yet',
                      text:
                          'Tell us what you need and the campus team will review it.',
                    ),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: records
                      .map((r) => RecordCard(record: r, isRequest: true))
                      .toList(),
                ),
        );
      },
    ),
    floatingActionButton: FloatingActionButton.extended(
      onPressed: () => showRequestForm(context),
      icon: const Icon(Icons.add),
      label: const Text('Request support'),
    ),
  );
}

class RecordCard extends StatelessWidget {
  const RecordCard({super.key, required this.record, this.isRequest = false});
  final Map<String, dynamic> record;
  final bool isRequest;
  @override
  Widget build(BuildContext context) {
    final status = '${record['status'] ?? 'pending'}'.replaceAll('_', ' ');
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(17),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    isRequest
                        ? (record['item_details'] ??
                                  record['purpose_of_funds'] ??
                                  record['category'] ??
                                  'Support request')
                              .toString()
                        : (record['item_name'] ??
                                  record['category'] ??
                                  'Donation')
                              .toString(),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: ink,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                StatusPill(status: status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '${record['category'] ?? ''}${record['quantity_needed'] != null ? ' · ${record['quantity_needed']} ${record['unit'] ?? 'needed'}' : ''}${record['quantity'] != null && !isRequest ? ' · Qty ${record['quantity']}' : ''}',
              style: const TextStyle(color: Colors.black54),
            ),
            if (record['urgency'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Priority: ${record['urgency']}',
                  style: const TextStyle(color: Colors.black54),
                ),
              ),
            if (record['justification'] != null &&
                '${record['justification']}'.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  '${record['justification']}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.black54),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class MatchesPage extends StatelessWidget {
  const MatchesPage({super.key});
  @override
  Widget build(
    BuildContext context,
  ) => FutureBuilder<List<Map<String, dynamic>>>(
    future: Api.list('matches'),
    builder: (context, snap) {
      if (snap.connectionState == ConnectionState.waiting)
        return const Center(child: CircularProgressIndicator());
      if (snap.hasError)
        return ErrorState(error: snap.error.toString(), onRetry: () {});
      final matches = snap.data ?? [];
      if (matches.isEmpty)
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(28),
            child: EmptyCard(
              title: 'No matches yet',
              text:
                  'When a donation and request are matched, you will see the handoff details here.',
            ),
          ),
        );
      return ListView(
        padding: const EdgeInsets.all(16),
        children: matches.map((m) {
          final d = m['donation'] is Map ? m['donation'] as Map : {};
          final r = m['request'] is Map ? m['request'] as Map : {};
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.handshake_outlined, color: green),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Text(
                          '${d['item_name'] ?? r['category'] ?? 'Community support'}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: ink,
                          ),
                        ),
                      ),
                      StatusPill(status: '${m['status'] ?? 'proposed'}'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Request: ${r['item_details'] ?? r['category'] ?? 'Support request'}',
                  ),
                  if (m['handoff_scheduled_at'] != null)
                    Text('Handoff: ${m['handoff_scheduled_at']}'),
                  if (m['pickup_hub'] != null)
                    Text('Pickup: ${m['pickup_hub']}'),
                  if (m['verification_pin'] != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Text(
                        'Handoff PIN: ${m['verification_pin']}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: green,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        }).toList(),
      );
    },
  );
}

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});
  @override
  Widget build(BuildContext context) => FutureBuilder<dynamic>(
    future: Api.call('notifications'),
    builder: (context, snap) {
      if (snap.connectionState == ConnectionState.waiting)
        return const Center(child: CircularProgressIndicator());
      if (snap.hasError)
        return ErrorState(error: snap.error.toString(), onRetry: () {});
      final data = snap.data;
      final items = data is Map && data['data'] is List
          ? data['data'] as List
          : <dynamic>[];
      if (items.isEmpty)
        return const Center(
          child: EmptyCard(
            title: 'You are all caught up',
            text:
                'Updates about donations, requests, and handoffs will show here.',
          ),
        );
      return ListView(
        padding: const EdgeInsets.all(16),
        children: items.map((item) {
          final n = Map<String, dynamic>.from(item);
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Color(0xFFE4F2EC),
                child: Icon(Icons.notifications_outlined, color: green),
              ),
              title: Text('${n['message'] ?? 'ReliefLink update'}'),
              subtitle: Text('${n['created_at'] ?? ''}'),
              isThreeLine: true,
            ),
          );
        }).toList(),
      );
    },
  );
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.status});
  final String status;
  @override
  Widget build(BuildContext context) {
    final color =
        status.contains('approved') ||
            status.contains('confirm') ||
            status.contains('fulfill')
        ? green
        : status.contains('reject') || status.contains('cancel')
        ? Colors.red.shade700
        : Colors.orange.shade800;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .10),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class EmptyCard extends StatelessWidget {
  const EmptyCard({super.key, required this.title, required this.text});
  final String title, text;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(22),
      child: Column(
        children: [
          const Icon(Icons.volunteer_activism_outlined, size: 34, color: green),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.bold, color: ink),
          ),
          const SizedBox(height: 5),
          Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.black54, height: 1.4),
          ),
        ],
      ),
    ),
  );
}

class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.error, required this.onRetry});
  final String error;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_outlined, color: Colors.orange, size: 34),
          const SizedBox(height: 12),
          Text(error, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Try again')),
        ],
      ),
    ),
  );
}

Future<void> showDonationForm(BuildContext context) async {
  final name = TextEditingController();
  final category = TextEditingController(text: 'Food');
  final qty = TextEditingController(text: '1');
  final notes = TextEditingController();
  final location = TextEditingController();
  String type = 'physical';
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Make a donation',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: ink,
                ),
              ),
              const SizedBox(height: 14),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'physical', label: Text('Items')),
                  ButtonSegment(value: 'financial', label: Text('Funds')),
                ],
                selected: {type},
                onSelectionChanged: (v) => setState(() => type = v.first),
              ),
              const SizedBox(height: 12),
              _formField(name, 'What are you donating?'),
              _formField(category, 'Category (Food, Clothing, etc.)'),
              _formField(
                qty,
                type == 'physical' ? 'Quantity' : 'Amount (PHP)',
                keyboard: TextInputType.number,
              ),
              _formField(notes, 'Notes or condition (optional)'),
              _formField(location, 'Pickup location (optional)'),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () async {
                    try {
                      final body = <String, dynamic>{
                        'donation_type': type,
                        'item_name': name.text.trim(),
                        'category': category.text.trim(),
                        'condition_notes': notes.text.trim(),
                        'pickup_location': location.text.trim(),
                        'currency': 'PHP',
                      };
                      if (type == 'physical') {
                        body['quantity'] = int.tryParse(qty.text) ?? 1;
                      } else {
                        body['amount'] = double.tryParse(qty.text) ?? 1;
                      }
                      await Api.call('donations', method: 'POST', body: body);
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Donation submitted for staff intake.',
                            ),
                          ),
                        );
                      }
                    } catch (e) {
                      if (ctx.mounted)
                        ScaffoldMessenger.of(
                          ctx,
                        ).showSnackBar(SnackBar(content: Text('$e')));
                    }
                  },
                  child: const Text('Submit donation'),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  name.dispose();
  category.dispose();
  qty.dispose();
  notes.dispose();
  location.dispose();
}

Future<void> showRequestForm(BuildContext context) async {
  final category = TextEditingController(text: 'Food');
  final details = TextEditingController();
  final qty = TextEditingController(text: '1');
  final reason = TextEditingController();
  String urgency = 'medium', type = 'physical';
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Request support',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: ink,
                ),
              ),
              const SizedBox(height: 14),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'physical', label: Text('Items')),
                  ButtonSegment(value: 'financial', label: Text('Funds')),
                ],
                selected: {type},
                onSelectionChanged: (v) => setState(() => type = v.first),
              ),
              const SizedBox(height: 12),
              _formField(category, 'Category'),
              _formField(
                details,
                type == 'physical'
                    ? 'What do you need?'
                    : 'Item or expense details',
              ),
              _formField(
                qty,
                type == 'physical'
                    ? 'Quantity needed'
                    : 'Amount requested (PHP)',
                keyboard: TextInputType.number,
              ),
              DropdownButtonFormField<String>(
                initialValue: urgency,
                decoration: const InputDecoration(labelText: 'Priority'),
                items: const [
                  DropdownMenuItem(value: 'low', child: Text('Low')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium')),
                  DropdownMenuItem(value: 'high', child: Text('High')),
                ],
                onChanged: (v) => setState(() => urgency = v ?? 'medium'),
              ),
              const SizedBox(height: 12),
              _formField(
                reason,
                type == 'physical'
                    ? 'Why do you need this?'
                    : 'Purpose of funds',
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () async {
                    try {
                      final body = <String, dynamic>{
                        'request_type': type,
                        'category': category.text.trim(),
                        'urgency': urgency,
                        'justification': reason.text.trim(),
                      };
                      if (type == 'physical') {
                        body.addAll({
                          'item_details': details.text.trim(),
                          'quantity_needed': int.tryParse(qty.text) ?? 1,
                          'unit': 'items',
                        });
                      } else {
                        body.addAll({
                          'purpose_of_funds': reason.text.trim(),
                          'amount_requested': double.tryParse(qty.text) ?? 1,
                          'quantity_needed': 1,
                          'currency': 'PHP',
                        });
                      }
                      await Api.call('requests', method: 'POST', body: body);
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Request submitted for verification.',
                            ),
                          ),
                        );
                      }
                    } catch (e) {
                      if (ctx.mounted)
                        ScaffoldMessenger.of(
                          ctx,
                        ).showSnackBar(SnackBar(content: Text('$e')));
                    }
                  },
                  child: const Text('Submit request'),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  category.dispose();
  details.dispose();
  qty.dispose();
  reason.dispose();
}

Widget _formField(
  TextEditingController controller,
  String label, {
  TextInputType? keyboard,
}) => Padding(
  padding: const EdgeInsets.only(bottom: 12),
  child: TextField(
    controller: controller,
    keyboardType: keyboard,
    decoration: InputDecoration(labelText: label),
  ),
);
