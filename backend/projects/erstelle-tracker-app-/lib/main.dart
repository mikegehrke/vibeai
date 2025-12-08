import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'erstelle-tracker-app-',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('erstelle-tracker-app-'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('**App Name**: TrackMate

**Beschreibung**: TrackMate ist eine vielseitige Tracking-App, die es Nutzern ermöglicht, persönliche Ziele zu setzen und deren Fortschritt in Echtzeit zu überwachen. Ob Fitnessziele, Projekt-Meilensteine oder alltägliche Aufgaben - TrackMate hilft, den Überblick zu behalten und motiviert durch visuelle Fortschrittsanzeigen.

**Features**:
1. **Dashboard**: Übersichtsseite mit allen aktiven Trackern und deren Fortschritt.
2. **Benutzerdefinierte Tracker**: Nutzer können eigene Tracker für verschiedene Zieltypen erstellen (z.B. Schritte, Kalorien, Lernstunden).
3. **Erinnerungen**: Push-Benachrichtigungen zur Erinnerung an gesetzte Ziele oder Aufgaben.
4. **Statistiken & Analysen**: Detaillierte Berichte über Fortschritte, inklusive Diagramme und Trends.
5. **Community-Feature**: Möglichkeit, Fortschritte mit Freunden zu teilen und sich gegenseitig zu motivieren.
6. **Synchronisation**: Automatische Synchronisation mit gängigen Fitness-Trackern und Kalender-Apps.
7. **Datenschutzfunktionen**: Nutzer können bestimmen, welche Daten öffentlich oder privat sind.
8. **Dark Mode**: Umschaltbare Benutzeroberfläche zwischen hellem und dunklem Modus.

**UI/UX**:
- **Design-Vorgaben**: Minimalistisches und intuitives Design mit klaren Linien.
- **Farben**: Hauptfarben sind Blau (#3B82F6) und Weiß (#FFFFFF), Akzentfarbe ist Grün (#10B981).
- **Style**: Flaches Design mit großzügigem Weißraum und Fokus auf Lesbarkeit.

**Technische Details**:
- **APIs**: Nutzung von Google Fit API und Apple HealthKit für Fitnessdaten, Firebase für Push-Benachrichtigungen.
- **Datenbank**: Firebase Cloud Firestore für Echtzeit-Datenspeicherung und -abruf.
- **Auth**: Firebase Authentication mit Unterstützung für Google und Apple Login.

**Bildschirme/Pages**:
1. **Login/Signup Page**: Authentifizierung der Nutzer.
2. **Dashboard**: Übersicht aller aktiven und abgeschlossenen Tracker.
3. **Tracker-Erstellungsseite**: Erstellen neuer Tracker mit verschiedenen Zieltypen.
4. **Detailansicht eines Trackers**: Anzeige detaillierter Statistiken und Fortschrittsverlauf.
5. **Einstellungen**: Anpassung von Benachrichtigungen, Datenschutz und App-Themes.
6. **Community Page**: Verbindung mit anderen Nutzern, Teilen von Fortschritten.
7. **Profilseite**: Verwaltung persönlicher Daten und Integrationseinstellungen.

**Datenmodelle**:
- **User**: Enthält Informationen wie Name, E-Mail, Profilbild, Authentifizierungsmethode.
- **Tracker**: Details zu jedem Tracker, wie Titel, Zieltyp, aktueller Fortschritt, Startdatum, Enddatum.
- **Progress**: Historische Fortschrittsdaten für jeden Tracker.
- **Settings**: Benutzerspezifische Einstellungen für Benachrichtigungen und Datenschutz.

**Integration**:
- **Maps**: Integration von Google Maps API für Aktivitäten, die Geolocation-Daten verwenden (z.B. Laufstrecken).
- **Payment**: Optionale Integration von Stripe für Premium-Features oder Abonnements.'),
          ],
        ),
      ),
    );
  }
}