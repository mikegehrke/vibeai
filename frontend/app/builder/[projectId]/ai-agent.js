/**
 * UNIVERSAL AI APP BUILDER AGENT
 * Generiert Apps für ALLE Programmiersprachen automatisch
 */

export const APP_TEMPLATES = {
  // MOBILE APPS
  flutter: {
    name: 'Flutter App',
    language: 'dart',
    files: [
      { path: 'lib/main.dart', template: 'flutter_main' },
      { path: 'lib/screens/home_screen.dart', template: 'flutter_screen' },
      { path: 'lib/widgets/custom_card.dart', template: 'flutter_widget' },
      { path: 'lib/models/user.dart', template: 'flutter_model' },
      { path: 'pubspec.yaml', template: 'flutter_pubspec' }
    ],
    preview: 'interactive_mobile'
  },

  react_native: {
    name: 'React Native App',
    language: 'javascript',
    files: [
      { path: 'App.js', template: 'rn_app' },
      { path: 'src/screens/HomeScreen.js', template: 'rn_screen' },
      { path: 'src/components/Card.js', template: 'rn_component' },
      { path: 'src/navigation/AppNavigator.js', template: 'rn_navigation' },
      { path: 'package.json', template: 'rn_package' }
    ],
    preview: 'interactive_mobile'
  },

  ios_native: {
    name: 'iOS Native (SwiftUI)',
    language: 'swift',
    files: [
      { path: 'ContentView.swift', template: 'swift_main' },
      { path: 'Views/HomeView.swift', template: 'swift_view' },
      { path: 'Models/User.swift', template: 'swift_model' },
      { path: 'ViewModels/HomeViewModel.swift', template: 'swift_viewmodel' }
    ],
    preview: 'ios_simulator'
  },

  android_native: {
    name: 'Android Native (Kotlin)',
    language: 'kotlin',
    files: [
      { path: 'MainActivity.kt', template: 'kotlin_activity' },
      { path: 'ui/HomeScreen.kt', template: 'kotlin_screen' },
      { path: 'data/User.kt', template: 'kotlin_model' },
      { path: 'viewmodel/HomeViewModel.kt', template: 'kotlin_viewmodel' }
    ],
    preview: 'android_simulator'
  },

  // WEB FRAMEWORKS
  nextjs: {
    name: 'Next.js App',
    language: 'javascript',
    files: [
      { path: 'app/page.js', template: 'nextjs_page' },
      { path: 'app/components/Header.js', template: 'nextjs_component' },
      { path: 'app/api/users/route.js', template: 'nextjs_api' },
      { path: 'package.json', template: 'nextjs_package' }
    ],
    preview: 'web_browser'
  },

  react: {
    name: 'React App',
    language: 'javascript',
    files: [
      { path: 'src/App.js', template: 'react_app' },
      { path: 'src/components/Header.js', template: 'react_component' },
      { path: 'src/pages/Home.js', template: 'react_page' },
      { path: 'package.json', template: 'react_package' }
    ],
    preview: 'web_browser'
  },

  vue: {
    name: 'Vue.js App',
    language: 'javascript',
    files: [
      { path: 'src/App.vue', template: 'vue_app' },
      { path: 'src/components/Header.vue', template: 'vue_component' },
      { path: 'src/views/Home.vue', template: 'vue_view' },
      { path: 'package.json', template: 'vue_package' }
    ],
    preview: 'web_browser'
  },

  angular: {
    name: 'Angular App',
    language: 'typescript',
    files: [
      { path: 'src/app/app.component.ts', template: 'angular_component' },
      { path: 'src/app/home/home.component.ts', template: 'angular_home' },
      { path: 'src/app/services/api.service.ts', template: 'angular_service' },
      { path: 'package.json', template: 'angular_package' }
    ],
    preview: 'web_browser'
  },

  // BACKEND FRAMEWORKS
  nodejs: {
    name: 'Node.js API',
    language: 'javascript',
    files: [
      { path: 'server.js', template: 'node_server' },
      { path: 'routes/users.js', template: 'node_routes' },
      { path: 'models/User.js', template: 'node_model' },
      { path: 'package.json', template: 'node_package' }
    ],
    preview: 'api_docs'
  },

  fastapi: {
    name: 'FastAPI Backend',
    language: 'python',
    files: [
      { path: 'main.py', template: 'fastapi_main' },
      { path: 'routers/users.py', template: 'fastapi_router' },
      { path: 'models/user.py', template: 'fastapi_model' },
      { path: 'requirements.txt', template: 'fastapi_requirements' }
    ],
    preview: 'api_docs'
  },

  django: {
    name: 'Django App',
    language: 'python',
    files: [
      { path: 'views.py', template: 'django_views' },
      { path: 'models.py', template: 'django_models' },
      { path: 'urls.py', template: 'django_urls' },
      { path: 'serializers.py', template: 'django_serializers' }
    ],
    preview: 'web_browser'
  },

  laravel: {
    name: 'Laravel App',
    language: 'php',
    files: [
      { path: 'routes/web.php', template: 'laravel_routes' },
      { path: 'app/Http/Controllers/UserController.php', template: 'laravel_controller' },
      { path: 'app/Models/User.php', template: 'laravel_model' },
      { path: 'resources/views/home.blade.php', template: 'laravel_view' }
    ],
    preview: 'web_browser'
  }
};

// CODE TEMPLATES FÜR ALLE SPRACHEN
export const CODE_TEMPLATES = {
  // FLUTTER TEMPLATES
  flutter_main: (appName) => `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const ${appName}App());
}

class ${appName}App extends StatelessWidget {
  const ${appName}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appName}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}`,

  flutter_screen: (screenName) => `import 'package:flutter/material.dart';
import '../widgets/custom_card.dart';

class ${screenName}Screen extends StatefulWidget {
  const ${screenName}Screen({super.key});

  @override
  State<${screenName}Screen> createState() => _${screenName}ScreenState();
}

class _${screenName}ScreenState extends State<${screenName}Screen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${screenName}'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CustomCard(
            title: 'Feature 1',
            subtitle: 'Beschreibung',
            icon: Icons.star,
            onTap: () {},
          ),
          CustomCard(
            title: 'Feature 2',
            subtitle: 'Beschreibung',
            icon: Icons.settings,
            onTap: () {},
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}`,

  flutter_widget: () => `import 'package:flutter/material.dart';

class CustomCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const CustomCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, size: 32, color: Theme.of(context).primaryColor),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}`,

  // REACT NATIVE TEMPLATES
  rn_app: (appName) => `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}`,

  rn_screen: (screenName) => `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Card from '../components/Card';

export default function ${screenName}Screen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>${screenName}</Text>
      <Card title="Feature 1" subtitle="Beschreibung" />
      <Card title="Feature 2" subtitle="Beschreibung" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 }
});`,

  // NEXT.JS TEMPLATES
  nextjs_page: (pageName) => `export default function ${pageName}Page() {
  return (
    <div className="container">
      <h1>${pageName}</h1>
      <div className="grid">
        <div className="card">
          <h2>Feature 1</h2>
          <p>Beschreibung</p>
        </div>
        <div className="card">
          <h2>Feature 2</h2>
          <p>Beschreibung</p>
        </div>
      </div>
    </div>
  );
}`,

  // FASTAPI TEMPLATES
  fastapi_main: (appName) => `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users

app = FastAPI(title="${appName} API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "${appName} API is running"}`,

  fastapi_router: () => `from fastapi import APIRouter
from models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users():
    return [{"id": 1, "name": "John Doe"}]

@router.post("/")
async def create_user(user: User):
    return user`
};

// AI AGENT - Erkennt Anfrage und generiert automatisch
export async function generateAppFromPrompt(prompt, platform) {
  const template = APP_TEMPLATES[platform];
  if (!template) {
    throw new Error(`Platform ${platform} not supported`);
  }

  // Extract app name from prompt
  const appName = extractAppName(prompt);

  // Generate all files
  const generatedFiles = template.files.map(fileConfig => {
    const templateFn = CODE_TEMPLATES[fileConfig.template];
    const content = typeof templateFn === 'function'
      ? templateFn(appName)
      : templateFn || '// Generated code';

    return {
      path: fileConfig.path,
      content: content,
      language: template.language
    };
  });

  return {
    files: generatedFiles,
    previewType: template.preview,
    appName: appName
  };
}

function extractAppName(prompt) {
  // Simple extraction - kann mit AI verbessert werden
  const match = prompt.match(/(?:erstell|mach|bau).*?(?:app|anwendung).*?(?:für|mit|namens)?\s+([A-Za-zäöüÄÖÜß]+)/i);
  return match ? match[1] : 'MyApp';
}
