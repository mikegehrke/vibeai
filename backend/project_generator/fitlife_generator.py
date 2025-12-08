"""
FITLIFE APP - KOMPLETTER FLUTTER GENERATOR
Generiert ein VOLLSTÄNDIGES, LAUFFÄHIGES Flutter Fitness-App Projekt
"""

def generate_fitlife_project(project_name="fitlife_app"):
    """Generiert das komplette FitLife Flutter Projekt"""
    
    files = []
    
    # ============================================
    # 1. PUBSPEC.YAML
    # ============================================
    files.append({
        "path": "pubspec.yaml",
        "content": f"""name: {project_name}
description: Moderne Fitness-App mit Workouts, Timer und Profil
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
"""
    })
    
    # ============================================
    # 2. MAIN.DART
    # ============================================
    files.append({
        "path": "lib/main.dart",
        "content": """import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'ui/screens/home_screen.dart';
import 'ui/screens/workouts_screen.dart';
import 'ui/screens/profile_screen.dart';

void main() {
  runApp(const FitLifeApp());
}

class FitLifeApp extends StatefulWidget {
  const FitLifeApp({super.key});

  @override
  State<FitLifeApp> createState() => _FitLifeAppState();
}

class _FitLifeAppState extends State<FitLifeApp> {
  bool isDarkMode = false;

  void toggleTheme() {
    setState(() {
      isDarkMode = !isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitLife',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: MainNavigation(
        isDarkMode: isDarkMode,
        onThemeToggle: toggleTheme,
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onThemeToggle;

  const MainNavigation({
    super.key,
    required this.isDarkMode,
    required this.onThemeToggle,
  });

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(onThemeToggle: widget.onThemeToggle, isDarkMode: widget.isDarkMode),
      const WorkoutsScreen(),
      ProfileScreen(isDarkMode: widget.isDarkMode),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: 'Workouts'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 3. THEME
    # ============================================
    files.append({
        "path": "lib/theme/app_theme.dart",
        "content": """import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: Colors.blue,
    scaffoldBackgroundColor: Colors.grey[50],
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: Colors.blue,
    scaffoldBackgroundColor: const Color(0xFF121212),
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.dark,
    ),
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: true,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );
}
"""
    })
    
    # ============================================
    # 4. MODELS
    # ============================================
    files.append({
        "path": "lib/models/exercise.dart",
        "content": """class Exercise {
  final String name;
  final int duration; // in seconds
  final String description;
  final String imageUrl;

  Exercise({
    required this.name,
    required this.duration,
    required this.description,
    this.imageUrl = 'https://via.placeholder.com/400x300',
  });
}
"""
    })
    
    files.append({
        "path": "lib/models/workout.dart",
        "content": """import 'exercise.dart';

class Workout {
  final String id;
  final String title;
  final String level; // Beginner, Intermediate, Advanced
  final List<Exercise> exercises;
  final String description;

  Workout({
    required this.id,
    required this.title,
    required this.level,
    required this.exercises,
    required this.description,
  });
}
"""
    })
    
    # ============================================
    # 5. DATA
    # ============================================
    files.append({
        "path": "lib/data/workout_data.dart",
        "content": """import '../models/workout.dart';
import '../models/exercise.dart';

class WorkoutData {
  static List<Workout> getAllWorkouts() {
    return [
      Workout(
        id: '1',
        title: 'Morning Cardio',
        level: 'Beginner',
        description: 'Start your day with energy',
        exercises: [
          Exercise(name: 'Jumping Jacks', duration: 30, description: 'Jump and spread arms and legs'),
          Exercise(name: 'High Knees', duration: 30, description: 'Run in place, knees high'),
          Exercise(name: 'Butt Kicks', duration: 30, description: 'Kick heels to butt'),
        ],
      ),
      Workout(
        id: '2',
        title: 'Strength Builder',
        level: 'Intermediate',
        description: 'Build muscle and power',
        exercises: [
          Exercise(name: 'Push-ups', duration: 45, description: 'Classic upper body exercise'),
          Exercise(name: 'Squats', duration: 45, description: 'Lower body power'),
          Exercise(name: 'Plank', duration: 60, description: 'Core stability'),
        ],
      ),
      Workout(
        id: '3',
        title: 'Beast Mode',
        level: 'Advanced',
        description: 'Push your limits',
        exercises: [
          Exercise(name: 'Burpees', duration: 60, description: 'Full body explosive'),
          Exercise(name: 'Mountain Climbers', duration: 60, description: 'Cardio + core'),
          Exercise(name: 'Jump Squats', duration: 45, description: 'Explosive legs'),
        ],
      ),
    ];
  }
}
"""
    })
    
    # ============================================
    # 6. HOME SCREEN
    # ============================================
    files.append({
        "path": "lib/ui/screens/home_screen.dart",
        "content": """import 'package:flutter/material.dart';
import 'workouts_screen.dart';

class HomeScreen extends StatelessWidget {
  final VoidCallback onThemeToggle;
  final bool isDarkMode;

  const HomeScreen({
    super.key,
    required this.onThemeToggle,
    required this.isDarkMode,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FitLife'),
        actions: [
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: onThemeToggle,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome back, Mike',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 30),
            Center(
              child: SizedBox(
                width: 200,
                height: 200,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      height: 200,
                      child: CircularProgressIndicator(
                        value: 0.65,
                        strokeWidth: 12,
                        backgroundColor: Colors.grey[300],
                      ),
                    ),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '65%',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Today',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const WorkoutsScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Start Workout', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 7. WORKOUTS SCREEN
    # ============================================
    files.append({
        "path": "lib/ui/screens/workouts_screen.dart",
        "content": """import 'package:flutter/material.dart';
import '../../data/workout_data.dart';
import '../../models/workout.dart';
import '../widgets/workout_card.dart';
import 'workout_detail_screen.dart';

class WorkoutsScreen extends StatelessWidget {
  const WorkoutsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final workouts = WorkoutData.getAllWorkouts();

    return Scaffold(
      appBar: AppBar(title: const Text('Workouts')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: workouts.length,
        itemBuilder: (context, index) {
          final workout = workouts[index];
          return WorkoutCard(
            workout: workout,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => WorkoutDetailScreen(workout: workout),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 8. WORKOUT DETAIL SCREEN
    # ============================================
    files.append({
        "path": "lib/ui/screens/workout_detail_screen.dart",
        "content": """import 'package:flutter/material.dart';
import '../../models/workout.dart';
import '../widgets/exercise_tile.dart';
import 'exercise_screen.dart';

class WorkoutDetailScreen extends StatelessWidget {
  final Workout workout;

  const WorkoutDetailScreen({super.key, required this.workout});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(workout.title)),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: Theme.of(context).primaryColor.withOpacity(0.1),
            child: Column(
              children: [
                Text(
                  workout.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(workout.description),
                const SizedBox(height: 8),
                Chip(label: Text(workout.level)),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: workout.exercises.length,
              itemBuilder: (context, index) {
                final exercise = workout.exercises[index];
                return ExerciseTile(
                  exercise: exercise,
                  index: index + 1,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ExerciseScreen(
                          exercise: exercise,
                          exercises: workout.exercises,
                          currentIndex: index,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  if (workout.exercises.isNotEmpty) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ExerciseScreen(
                          exercise: workout.exercises.first,
                          exercises: workout.exercises,
                          currentIndex: 0,
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Start Workout', style: TextStyle(fontSize: 18)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 9. EXERCISE SCREEN (mit Timer)
    # ============================================
    files.append({
        "path": "lib/ui/screens/exercise_screen.dart",
        "content": """import 'dart:async';
import 'package:flutter/material.dart';
import '../../models/exercise.dart';

class ExerciseScreen extends StatefulWidget {
  final Exercise exercise;
  final List<Exercise> exercises;
  final int currentIndex;

  const ExerciseScreen({
    super.key,
    required this.exercise,
    required this.exercises,
    required this.currentIndex,
  });

  @override
  State<ExerciseScreen> createState() => _ExerciseScreenState();
}

class _ExerciseScreenState extends State<ExerciseScreen> {
  late int timeRemaining;
  Timer? timer;
  bool isRunning = false;

  @override
  void initState() {
    super.initState();
    timeRemaining = widget.exercise.duration;
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  void startTimer() {
    if (isRunning) return;
    setState(() => isRunning = true);

    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (timeRemaining > 0) {
        setState(() => timeRemaining--);
      } else {
        t.cancel();
        setState(() => isRunning = false);
        showCompletionDialog();
      }
    });
  }

  void pauseTimer() {
    timer?.cancel();
    setState(() => isRunning = false);
  }

  void resetTimer() {
    timer?.cancel();
    setState(() {
      timeRemaining = widget.exercise.duration;
      isRunning = false;
    });
  }

  void showCompletionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exercise Complete!'),
        content: const Text('Great job! Ready for the next one?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Finish'),
          ),
          if (widget.currentIndex < widget.exercises.length - 1)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ExerciseScreen(
                      exercise: widget.exercises[widget.currentIndex + 1],
                      exercises: widget.exercises,
                      currentIndex: widget.currentIndex + 1,
                    ),
                  ),
                );
              },
              child: const Text('Next Exercise'),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.currentIndex + 1}/${widget.exercises.length}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              widget.exercise.name,
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                widget.exercise.imageUrl,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: 200,
              height: 200,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 200,
                    height: 200,
                    child: CircularProgressIndicator(
                      value: timeRemaining / widget.exercise.duration,
                      strokeWidth: 12,
                      backgroundColor: Colors.grey[300],
                    ),
                  ),
                  Text(
                    '$timeRemaining',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            Text(
              widget.exercise.description,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: const Icon(Icons.refresh, size: 32),
                  onPressed: resetTimer,
                ),
                FloatingActionButton.large(
                  onPressed: isRunning ? pauseTimer : startTimer,
                  child: Icon(isRunning ? Icons.pause : Icons.play_arrow, size: 32),
                ),
                const SizedBox(width: 48), // Spacer
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 10. PROFILE SCREEN
    # ============================================
    files.append({
        "path": "lib/ui/screens/profile_screen.dart",
        "content": """import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  final bool isDarkMode;

  const ProfileScreen({super.key, required this.isDarkMode});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final nameController = TextEditingController(text: 'Mike');
  final weightController = TextEditingController(text: '75');
  final heightController = TextEditingController(text: '180');

  double get bmi {
    final weight = double.tryParse(weightController.text) ?? 0;
    final height = (double.tryParse(heightController.text) ?? 0) / 100;
    if (weight == 0 || height == 0) return 0;
    return weight / (height * height);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              child: Icon(Icons.person, size: 50),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: weightController,
              decoration: const InputDecoration(
                labelText: 'Weight (kg)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: heightController,
              decoration: const InputDecoration(
                labelText: 'Height (cm)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 30),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Text(
                      'BMI Calculator',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      bmi.toStringAsFixed(1),
                      style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: bmi < 18.5
                            ? Colors.blue
                            : bmi < 25
                                ? Colors.green
                                : bmi < 30
                                    ? Colors.orange
                                    : Colors.red,
                      ),
                    ),
                    Text(
                      bmi < 18.5
                          ? 'Underweight'
                          : bmi < 25
                              ? 'Normal'
                              : bmi < 30
                                  ? 'Overweight'
                                  : 'Obese',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    nameController.dispose();
    weightController.dispose();
    heightController.dispose();
    super.dispose();
  }
}
"""
    })
    
    # ============================================
    # 11. WIDGETS
    # ============================================
    files.append({
        "path": "lib/ui/widgets/workout_card.dart",
        "content": """import 'package:flutter/material.dart';
import '../../models/workout.dart';

class WorkoutCard extends StatelessWidget {
  final Workout workout;
  final VoidCallback onTap;

  const WorkoutCard({super.key, required this.workout, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.fitness_center, size: 30),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      workout.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${workout.exercises.length} exercises • ${workout.level}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
"""
    })
    
    files.append({
        "path": "lib/ui/widgets/exercise_tile.dart",
        "content": """import 'package:flutter/material.dart';
import '../../models/exercise.dart';

class ExerciseTile extends StatelessWidget {
  final Exercise exercise;
  final int index;
  final VoidCallback onTap;

  const ExerciseTile({
    super.key,
    required this.exercise,
    required this.index,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          child: Text('$index'),
        ),
        title: Text(exercise.name),
        subtitle: Text('${exercise.duration}s'),
        trailing: const Icon(Icons.play_arrow),
        onTap: onTap,
      ),
    );
  }
}
"""
    })
    
    files.append({
        "path": "lib/ui/widgets/primary_button.dart",
        "content": """import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const PrimaryButton({
    super.key,
    required this.text,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(text, style: const TextStyle(fontSize: 18)),
      ),
    );
  }
}
"""
    })
    
    # ============================================
    # 12. README
    # ============================================
    files.append({
        "path": "README.md",
        "content": f"""# {project_name}

Moderne Flutter Fitness-App mit vollständiger Funktionalität.

## Features
- ✅ Home Screen mit Fortschrittsanzeige
- ✅ Workout-Liste (Beginner, Intermediate, Advanced)
- ✅ Workout-Details mit Übungen
- ✅ Exercise Screen mit 30s Timer
- ✅ Profil mit BMI-Rechner
- ✅ Dark/Light Mode Support

## Installation
```bash
flutter pub get
flutter run
```

## Struktur
```
lib/
├── main.dart
├── theme/app_theme.dart
├── models/
│   ├── workout.dart
│   └── exercise.dart
├── data/workout_data.dart
└── ui/
    ├── screens/
    │   ├── home_screen.dart
    │   ├── workouts_screen.dart
    │   ├── workout_detail_screen.dart
    │   ├── exercise_screen.dart
    │   └── profile_screen.dart
    └── widgets/
        ├── workout_card.dart
        ├── exercise_tile.dart
        └── primary_button.dart
```

Generiert von VibeAI Builder 🚀
"""
    })
    
    return {
        "project_name": project_name,
        "files": files,
        "total_files": len(files),
        "message": f"✅ Komplettes FitLife Flutter Projekt mit {len(files)} Dateien generiert!"
    }


if __name__ == "__main__":
    result = generate_fitlife_project()
    print(f"✅ {result['message']}")
    print(f"📁 Dateien: {result['total_files']}")
    for file in result['files']:
        print(f"  - {file['path']}")
