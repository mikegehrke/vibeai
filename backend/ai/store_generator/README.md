# 🏪 Store Generator

**Automatische App Store + Play Store Listings mit SEO, Icons, Screenshots, Manifesten**

Generiere komplette Store-Präsenz in Sekunden! Alle Metadaten, Assets, Legal-Dokumente und Build-Commands für iOS & Android.

## 🎯 Features

### Store Listings
- ✅ **App Store (iOS)** - Komplette iTunes Connect Metadaten
- ✅ **Play Store (Android)** - Google Play Console ready
- ✅ **SEO-Optimierung** - Keywords, Titel, Beschreibungen
- ✅ **Multi-Language** - Vorbereitet für Lokalisierung

### Assets
- ✅ **App Icons** - Alle Größen für iOS & Android
- ✅ **Splash Screens** - Launch screens für alle Devices
- ✅ **Screenshots** - Mockup-Specs für Store-Präsentation
- ✅ **Feature Graphics** - Android Feature Graphic (1024x500)

### Legal Documents
- ✅ **Privacy Policy** - GDPR-konform
- ✅ **Terms of Service** - Rechtskonform
- ✅ **Copyright** - Automatisch generiert

### Technical
- ✅ **Info.plist** - iOS Manifest
- ✅ **AndroidManifest.xml** - Android Manifest
- ✅ **build.gradle** - Android Build-Config
- ✅ **Build Commands** - Komplette Build-Anleitung

## 🚀 Quick Start

### 1. Generate Store Listing

```bash
curl -X POST http://localhost:8000/store-gen/generate \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "TaskMaster Pro",
    "app_description": "The ultimate productivity app",
    "category": "productivity",
    "platforms": "both",
    "keywords": ["tasks", "todo", "productivity"],
    "target_audience": "Professionals and students",
    "primary_color": "#007AFF",
    "version": "1.0.0"
  }'
```

### 2. Response Structure

```json
{
  "app_store_metadata": {
    "name": "TaskMaster Pro",
    "subtitle": "Get Things Done Faster",
    "description": "...",
    "keywords": "tasks, todo, productivity, ...",
    "category": "Productivity"
  },
  "play_store_metadata": {
    "title": "TaskMaster Pro",
    "short_description": "...",
    "full_description": "..."
  },
  "icon_exports": {...},
  "splash_exports": {...},
  "privacy_policy": "...",
  "terms_of_service": "...",
  "manifest_files": {...},
  "build_commands": "..."
}
```

## 📖 API Endpoints

### Store Generation

```
POST /store-gen/generate
  - Generiere komplettes Store Listing (iOS + Android)
  - Body: GenerateStoreRequest
  - Response: Alle Metadaten, Assets, Legal Docs

POST /store-gen/generate-metadata-only
  - Nur Store-Metadaten (kein Asset-Generation)
  - Schnell für Preview/SEO-Check

POST /store-gen/generate-assets-only
  - Nur Assets (Icons, Splash, Screenshots)
  - Für existierende Listings

POST /store-gen/generate-legal
  - Nur Legal-Dokumente
  - Privacy Policy + Terms of Service

POST /store-gen/generate-manifests
  - Platform Manifests + Build Commands
  - Info.plist, AndroidManifest.xml

GET /store-gen/categories
  - Liste aller App-Kategorien
  - Mit Beschreibungen

GET /store-gen/platforms
  - Platform-Requirements
  - Icon/Screenshot-Größen

POST /store-gen/optimize-keywords
  - SEO-Keyword-Optimierung
  - Automatische Vorschläge

POST /store-gen/validate-metadata
  - Validiere Metadaten vor Submission
  - Prüfe Limits und Best Practices

GET /store-gen/templates/{category}
  - Hole Template für Kategorie
  - Vorausgefüllte Beispiele
```

## 💡 Use Cases

### Use Case 1: Produktivitäts-App

```json
{
  "app_name": "TaskMaster Pro",
  "app_description": "The ultimate productivity app to manage your tasks, projects, and goals efficiently.",
  "category": "productivity",
  "platforms": "both",
  "keywords": ["tasks", "todo", "productivity", "planner", "organize", "efficiency"],
  "target_audience": "Professionals, students, and anyone looking to boost their productivity",
  "primary_color": "#007AFF"
}
```

**Generiert:**
- App Store Title: "TaskMaster Pro"
- Subtitle: "Get Things Done Faster"
- Description: 1,500+ Zeichen SEO-optimiert
- Keywords: "tasks, todo, productivity, planner, organize, efficiency, ..."
- 30+ Icon-Dateien (alle iOS/Android Größen)
- 10+ Splash-Screen-Dateien
- 6 Screenshot-Mockup-Specs
- Privacy Policy (2,000+ Wörter)
- Terms of Service (2,500+ Wörter)
- Info.plist für iOS
- AndroidManifest.xml für Android
- Komplette Build-Anleitung

### Use Case 2: Social Chat App

```json
{
  "app_name": "ChatHub",
  "app_description": "Connect with friends and family through instant messaging, voice calls, and video chats.",
  "category": "social",
  "platforms": "both",
  "keywords": ["chat", "messaging", "social", "friends", "video call", "connect"],
  "target_audience": "Social users who want to stay connected with friends and family",
  "primary_color": "#34C759"
}
```

### Use Case 3: Fitness Tracker

```json
{
  "app_name": "FitTracker",
  "app_description": "Track your fitness journey with workout plans, calorie counting, and health insights.",
  "category": "health",
  "platforms": "both",
  "keywords": ["fitness", "health", "workout", "tracker", "exercise", "wellness"],
  "target_audience": "Fitness enthusiasts and health-conscious individuals",
  "primary_color": "#FF3B30"
}
```

## 🎨 Categories

| Category | iOS Category | Android Category | Features |
|----------|-------------|------------------|----------|
| Business | Business | BUSINESS | 8 |
| Productivity | Productivity | PRODUCTIVITY | 8 |
| Social | Social Networking | SOCIAL | 8 |
| Education | Education | EDUCATION | 8 |
| Entertainment | Entertainment | ENTERTAINMENT | 8 |
| Finance | Finance | FINANCE | 8 |
| Health | Health & Fitness | HEALTH_AND_FITNESS | 8 |
| Lifestyle | Lifestyle | LIFESTYLE | 8 |
| Shopping | Shopping | SHOPPING | 8 |
| Travel | Travel | TRAVEL_AND_LOCAL | 8 |
| Utilities | Utilities | TOOLS | 8 |
| Games | Games | GAME_CASUAL | 8 |

## 📱 Icon Requirements

### iOS
- **App Store:** 1024x1024 (PNG, no transparency)
- **iPhone:** 60x60 (@2x, @3x), 76x76 (@2x), 83.5x83.5 (@2x)
- **iPad:** 76x76 (@1x, @2x), 83.5x83.5 (@2x)
- **Settings:** 29x29 (@1x, @2x, @3x)
- **Spotlight:** 40x40 (@2x, @3x)

### Android
- **Play Store:** 512x512 (PNG)
- **Launcher Icons:**
  - mdpi: 48x48
  - hdpi: 72x72
  - xhdpi: 96x96
  - xxhdpi: 144x144
  - xxxhdpi: 192x192
- **Adaptive Icons:** Foreground + Background

## 📸 Screenshot Requirements

### iOS
- **iPhone 14 Pro Max:** 1290x2796
- **iPhone 13 Pro Max:** 1284x2778
- **iPad Pro 12.9":** 2048x2732
- **Min:** 2 screenshots, **Max:** 10 screenshots

### Android
- **Pixel 7 Pro:** 1440x3120
- **Feature Graphic:** 1024x500 (required)
- **Min:** 2 screenshots, **Max:** 8 screenshots

## 🔐 Privacy & Legal

### Privacy Policy Includes
- Information Collection
- Data Usage
- Security Measures
- Third-Party Services
- Data Retention
- User Rights (GDPR-compliant)
- Children's Privacy (COPPA-compliant)
- Contact Information

### Terms of Service Includes
- Agreement to Terms
- Use License
- User Accounts
- Prohibited Uses
- Intellectual Property
- Termination
- Limitation of Liability
- Governing Law

## 🛠️ Build Commands

### iOS (Xcode)

```bash
# Install dependencies
cd ios
pod install

# Build archive
xcodebuild -workspace MyApp.xcworkspace \
           -scheme MyApp \
           -configuration Release \
           -archivePath build/MyApp.xcarchive \
           archive

# Export IPA
xcodebuild -exportArchive \
           -archivePath build/MyApp.xcarchive \
           -exportPath build \
           -exportOptionsPlist ExportOptions.plist
```

### Android (Gradle)

```bash
# Clean build
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Outputs:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

## 📊 Statistics

- **Categories:** 12
- **Platforms:** 2 (iOS, Android)
- **Icon Sizes:** 30+ (15 iOS, 15 Android)
- **Screenshot Sizes:** 6+ device types
- **Generated Lines:** 5,000-8,000 per store listing
- **Legal Docs:** 4,500+ words combined
- **Setup Time:** < 5 minutes

## 🚀 Example: Full Release Process

### Step 1: Generate Listing
```bash
curl -X POST http://localhost:8000/store-gen/generate \
  -H "Content-Type: application/json" \
  -d @release_config.json
```

### Step 2: Download Assets
```bash
# Response enthält:
# - icon_exports.json (30+ Icon-Specs)
# - splash_exports.json (10+ Splash-Specs)
# - screenshot_mockups.json (6 Screenshot-Specs)
# - privacy_policy.md
# - terms_of_service.md
# - Info.plist
# - AndroidManifest.xml
# - build_commands.sh
```

### Step 3: Prepare Assets
```bash
# Erstelle Icons mit Design-Tool (Figma, Sketch, etc.)
# Basierend auf icon_exports.json Specs

# Erstelle Screenshots mit Mockup-Tool
# Basierend auf screenshot_mockups.json Specs
```

### Step 4: Update Manifests
```bash
# iOS: Ersetze ios/MyApp/Info.plist
# Android: Ersetze android/app/src/main/AndroidManifest.xml
# Android: Update android/app/build.gradle
```

### Step 5: Build Apps
```bash
# iOS
cd ios && pod install
xcodebuild archive ...

# Android
cd android && ./gradlew bundleRelease
```

### Step 6: Submit to Stores
- **iOS:** Upload IPA via Xcode Organizer → App Store Connect
- **Android:** Upload AAB via Google Play Console

## 📄 License

MIT License

---

**Generated by VibeAI Store Generator** 🏪✨
