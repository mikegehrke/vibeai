import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '--Beschreibung----FitConnect-ist-eine-moderne-Fitn',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('--Beschreibung----FitConnect-ist-eine-moderne-Fitn'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('**App Name**: FitConnect Pro

**Beschreibung**:  
FitConnect Pro ist eine umfassende Fitness- und Gesundheits-Tracking-App, die es Nutzern ermöglicht, ihre sportlichen Aktivitäten zu überwachen, ihre Ernährung zu managen und sich mit einer Community von Gleichgesinnten zu vernetzen. Die App nutzt fortschrittliche AI-Coaching-Technologien, um personalisierte Fitness- und Ernährungstipps bereitzustellen, und motiviert die Nutzer durch soziale Herausforderungen und Gamification-Elemente. Das Design ist modern und minimalistisch mit einem ästhetisch ansprechenden dunklen Thema, das durch lebendige Akzentfarben hervorgehoben wird. Die App richtet sich an fitnessbewusste Nutzer im Alter von 18 bis 45 Jahren.

**Features**:  
1. **Workout Tracking**: Verfolge eine Vielzahl von Workouts und erhalte detaillierte Statistiken und Analysen.
2. **Ernährungsüberwachung**: Plane und protokolliere Mahlzeiten mit einer integrierten Kaloriendatenbank.
3. **Soziale Herausforderungen**: Erstelle oder nimm an Fitness-Challenges mit Freunden teil, um gemeinsam Ziele zu erreichen.
4. **AI-Coaching**: Nutze personalisierte Coaching-Tipps, die auf deinen Fortschritten basieren.
5. **Gamification-Elemente**: Sammle Punkte und Abzeichen für das Erreichen von Fitness-Meilensteinen.
6. **Progress-Animationen**: Erhalte motivierende visuelle Darstellungen deines Fortschritts.
7. **Push-Notifications**: Erhalte Erinnerungen und Updates zu Workouts und Ernährungszielen.
8. **Integration mit Fitness-Trackern**: Synchronisiere deine Daten mit Fitbit, Apple Watch und anderen Geräten.
9. **Social Media Sharing**: Teile deine Erfolge und Fortschritte auf sozialen Medien wie Instagram und Facebook.

**UI/UX**:  
- **Design-Vorgaben**: Dunkles Design mit lebhaften Akzentfarben wie Türkis und Orange.
- **Style**: Moderne, minimalistische Benutzeroberfläche mit klaren Linien und intuitiver Navigation.
- **Animationen**: Sanfte Übergänge und interaktive Visualisierungen zur Verbesserung der Benutzererfahrung.

**Technische Details**:  
- **APIs**: Integration mit Nutritionix für Kaloriendatenbanken, sowie Google Fit und Apple HealthKit für Fitness-Tracker-Daten.
- **Datenbank**: Cloud Firestore zur Speicherung von Benutzer-, Workout- und Ernährungsdaten.
- **Authentifizierung**: Firebase Authentication für eine sichere Benutzeranmeldung und -verwaltung.
- **Machine Learning**: TensorFlow Lite für On-Device AI-Coaching.

**Bildschirme/Pages**:  
1. **Startseite**: Übersicht über Workouts, Fortschritte und soziale Aktivitäten.
2. **Workout-Tracking**: Detaillierte Erfassung und Analyse von Workouts.
3. **Ernährungsübersicht**: Lebensmittelprotokollierung und Kalorienverfolgung.
4. **Herausforderungen**: Liste und Details zu sozialen Fitness-Challenges.
5. **Profil**: Benutzerprofil mit Fortschrittsverlauf und gesammelten Abzeichen.
6. **Einstellungen**: Anpassbare Benachrichtigungen und App-Einstellungen.
7. **AI-Coaching**: Personalisierte Tipps und Empfehlungen.
8. **Social Feed**: Aktivitäts-Feed mit Beiträgen von Freunden und Gruppen.

**Datenmodelle**:  
- **User**: Enthält Benutzerprofil, Auth-Token und verknüpfte Geräte.
- **Workout**: Speichert Informationen zu Workout-Typ, Dauer, Kalorienverbrauch und Datum.
- **Ernährung**: Enthält Daten zu Lebensmitteln, Kalorien, Nährwertangaben und Mahlzeitenzeitpunkt.
- **Herausforderungen**: Beinhaltet Details wie Herausforderungstyp, Status und Teilnehmer.
- **Progress**: Verfolgt Meilensteine, Abzeichen und Fortschrittshistorie.

**Integration**:  
- **Externe Services**: Integration von Google Maps für standortbasierte Herausforderungen und ein Payment Gateway für Premium-Features.
- **Social Integration**: API-Integration für Facebook und Instagram, um Erfolge und Fortschritte zu teilen.

Dieser detaillierte Prompt liefert dem App Builder Agent alle notwendigen Informationen, um die FitConnect Pro App vollständig zu entwickeln und bereitzustellen.'),
          ],
        ),
      ),
    );
  }
}