# Teams Setup E-Mail Konfiguration

Das Teams-Setup-Formular benötigt eine E-Mail-Konfiguration, um Benachrichtigungen zu versenden.

## Option 1: Resend API (Empfohlen - Einfacher)

Resend ist ein moderner E-Mail-Service, der einfacher einzurichten ist als SMTP.

### Setup:
1. Gehe zu https://resend.com und erstelle einen Account
2. Erstelle einen API Key
3. Füge diese Variablen zu deiner `.env` Datei hinzu:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@deine-domain.com
TEAMS_SETUP_EMAIL_TO=empfaenger@example.com
```

**Hinweis**: Für die `RESEND_FROM_EMAIL` musst du zuerst eine Domain bei Resend verifizieren. Für Tests kannst du `onboarding@resend.dev` verwenden.

## Option 2: SMTP (Traditionell)

Falls du SMTP verwenden möchtest (z.B. Gmail, Outlook, etc.):

### Setup für Gmail:
1. Aktiviere "2-Step Verification" in deinem Google Account
2. Erstelle ein "App Password" unter: https://myaccount.google.com/apppasswords
3. Füge diese Variablen zu deiner `.env` Datei hinzu:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=deine-email@gmail.com
SMTP_PASSWORD=dein-app-passwort
EMAIL_FROM=deine-email@gmail.com
TEAMS_SETUP_EMAIL_TO=empfaenger@example.com
```

### Setup für andere SMTP-Server:
```env
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=deine-email@example.com
SMTP_PASSWORD=dein-passwort
EMAIL_FROM=deine-email@example.com
TEAMS_SETUP_EMAIL_TO=empfaenger@example.com
```

## Testen

Nach der Konfiguration kannst du testen:

```bash
curl http://localhost:8000/api/teams/setup/test
```

Dies zeigt dir, welche E-Mail-Methode konfiguriert ist.

## Was wird versendet?

1. **Benachrichtigungs-E-Mail** an `TEAMS_SETUP_EMAIL_TO`:
   - Enthält alle Formulardaten
   - HTML-formatierte E-Mail

2. **Bestätigungs-E-Mail** an die `billing_email` aus dem Formular:
   - Bestätigt den Empfang der Anfrage
   - Freundliche Nachricht

## Fehlerbehebung

- **"SMTP credentials not configured"**: E-Mail-Variablen fehlen in der `.env` Datei
- **"Resend API error"**: API Key ist falsch oder ungültig
- **"Connection refused"**: SMTP-Server ist nicht erreichbar oder Port ist falsch

