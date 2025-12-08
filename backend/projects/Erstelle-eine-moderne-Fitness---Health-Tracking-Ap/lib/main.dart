import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Erstelle-eine-moderne-Fitness---Health-Tracking-Ap',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Erstelle-eine-moderne-Fitness---Health-Tracking-Ap'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('**App Name**: FitConnect

**Beschreibung**:
FitConnect ist eine moderne Fitness- und Gesundheits-Tracking-App, die es Nutzern ermöglicht, ihre Workouts zu verfolgen, ihre Ernährung zu überwachen und an sozialen Herausforderungen teilzunehmen. Die App bietet personalisiertes AI-Coaching, um Nutzer zu motivieren und zu unterstützen. Sie richtet sich an fitnessbewusste Menschen im Alter von 18 bis 45 Jahren und bietet eine ansprechende, motivierende Benutzeroberfläche im dunklen Design.

**Features**:
1. **Workout Tracking**: Verfolge verschiedene Workouts mit detaillierter Statistikanalyse.
2. **Ernährungsüberwachung**: Nutze eine integrierte Kaloriendatenbank, um Mahlzeiten zu planen und aufzuzeichnen.
3. **Soziale Herausforderungen**: Nimm an Herausforderungen teil und lade Freunde ein, um gemeinsam Ziele zu erreichen.
4. **AI-Coaching**: Erhalte personalisierte Coaching-Tipps basierend auf deinen Daten und Fortschritten.
5. **Gamification-Elemente**: Sammle Punkte und Abzeichen für das Erreichen von Meilensteinen.
6. **Progress-Animationen**: Visuelle Darstellungen des Fortschritts zur Motivation.
7. **Push-Notifications**: Erinnerungen und Updates für Workouts, Ernährungsziele und soziale Interaktionen.
8. **Integration mit Fitness-Trackern**: Synchronisiere mit Geräten wie Fitbit, Apple Watch etc.
9. **Social Media Sharing**: Teile Erfolge und Fortschritte auf Plattformen wie Instagram und Facebook.

**UI/UX**:
- **Design-Vorgaben**: Dunkles Design mit lebendigen Akzentfarben für Highlights (z.B. Türkis, Orange).
- **Style**: Moderne und minimalistische UI mit klaren Linien und intuitiver Navigation.
- **Animationen**: Sanfte Übergänge und interaktive Progress-Visualisierungen.

**Technische Details**:
- **APIs**: Integration mit einer Kaloriendatenbank-API (z.B. Nutritionix), Fitness-Tracker-APIs (z.B. Google Fit, Apple HealthKit).
- **Datenbank**: Cloud Firestore zur Speicherung von Benutzer- und Workout-Daten.
- **Authentifizierung**: Firebase Authentication für sichere Benutzeranmeldung und -verwaltung.
- **Machine Learning**: TensorFlow Lite für On-Device AI-Coaching-Funktionen.

**Bildschirme/Pages**:
1. **Startseite**: Übersicht von Workouts, Fortschritt und sozialen Updates.
2. **Workout-Tracking**: Detaillierte Workout-Aufzeichnung und -Analyse.
3. **Ernährungsübersicht**: Lebensmittelprotokoll und Kalorienverfolgung.
4. **Herausforderungen**: Liste und Details von sozialen Herausforderungen.
5. **Profil**: Benutzerprofil mit Fortschrittsverlauf und Abzeichen.
6. **Einstellungen**: Anpassbare Benachrichtigungen und App-Einstellungen.
7. **AI-Coaching**: Personalisierte Tipps und Empfehlungen.
8. **Social Feed**: Aktivitätsfeed mit Beiträgen von Freunden und Gruppen.

**Datenmodelle**:
- **User**: Benutzerprofil, Auth-Token, verknüpfte Geräte.
- **Workout**: Workout-Typ, Dauer, Kalorienverbrauch, Datum.
- **Ernährung**: Lebensmittel, Kalorien, Nährwertangaben, Mahlzeitenzeitpunkt.
- **Herausforderungen**: Herausforderungstyp, Status, Teilnehmer.
- **Progress**: Meilensteine, Abzeichen, Fortschrittshistorie.

**Integration**:
- **Externe Services**: Google Maps für Standortbasierte Herausforderungen, Payment Gateway für Premium-Features.
- **Social Integration**: API-Integration für Facebook und Instagram zum Teilen von Erfolgen.

Dieser detaillierte Prompt sollte deinem App Builder Agent eine klare und umfassende Anleitung geben, um die FitConnect App vollständig zu entwickeln und bereitzustellen.'),
          ],
        ),
      ),
    );
  }
}