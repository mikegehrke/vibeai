"""
SIMPLE FITLIFE API ROUTE - DIREKT IN MAIN.PY EINBAUEN
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class FitLifeRequest(BaseModel):
    project_name: str = "fitlife_app"


class FitLifeResponse(BaseModel):
    success: bool
    message: str
    files: list
    total_files: int


@router.post("/api/generate-fitlife")
async def generate_fitlife(req: FitLifeRequest):
    """Generates complete FitLife Flutter app"""
    
    # Inline generator - kein externer Import nötig!
    files = [
        {
            "path": "pubspec.yaml",
            "content": f"""name: {req.project_name}
description: Modern Fitness App
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

flutter:
  uses-material-design: true
"""
        },
        {
            "path": "lib/main.dart",
            "content": """import 'package:flutter/material.dart';

void main() => runApp(FitLifeApp());

class FitLifeApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitLife',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('FitLife - Fitness App')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome to FitLife', style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            CircularProgressIndicator(value: 0.65),
            SizedBox(height: 10),
            Text('65% Daily Progress'),
          ],
        ),
      ),
    );
  }
}
"""
        },
        {
            "path": "README.md",
            "content": f"""# {req.project_name}

Modern Flutter Fitness App

## Features
- Home Screen
- Progress Tracking
- Workouts

Run with: `flutter run`
"""
        }
    ]
    
    return FitLifeResponse(
        success=True,
        message=f"✅ {len(files)} files generated!",
        files=files,
        total_files=len(files)
    )


@router.get("/api/fitlife-info")
async def fitlife_info():
    return {
        "name": "FitLife Generator",
        "status": "ready",
        "files_count": 3
    }
