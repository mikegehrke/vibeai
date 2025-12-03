# -------------------------------------------------------------
# VIBEAI – AUTH GENERATOR (UI + BACKEND)
# -------------------------------------------------------------
import os
from typing import Dict, List, Any, Optional


class AuthGenerator:
    """
    Generiert komplette Auth-Systeme für verschiedene Frameworks:
    - Backend: FastAPI, Node.js, Django
    - Frontend: Flutter, React, Next.js, Vue
    - Features: Login, Signup, Forgot Password, JWT, Session Handling
    """

    def __init__(self):
        self.supported_backends = ["fastapi", "nodejs", "django"]
        self.supported_frontends = ["flutter", "react", "nextjs", "vue"]

    def generate_backend(self, framework: str, base_path: str, options: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generiert Backend Auth Code
        
        Args:
            framework: fastapi, nodejs, django
            base_path: Ziel-Verzeichnis
            options: Optionale Konfiguration (jwt_secret, session_timeout, etc.)
        
        Returns:
            Dict mit success, files, framework, features
        """
        if framework not in self.supported_backends:
            return {
                "success": False,
                "error": f"Framework '{framework}' nicht unterstützt. Verfügbar: {self.supported_backends}"
            }

        options = options or {}
        jwt_secret = options.get("jwt_secret", "VIBEAI_SECRET_KEY")
        session_timeout = options.get("session_timeout", 86400)  # 24h

        if framework == "fastapi":
            return self._generate_fastapi_backend(base_path, jwt_secret, session_timeout)
        elif framework == "nodejs":
            return self._generate_nodejs_backend(base_path, jwt_secret, session_timeout)
        elif framework == "django":
            return self._generate_django_backend(base_path, jwt_secret, session_timeout)

    def _generate_fastapi_backend(self, base_path: str, jwt_secret: str, session_timeout: int) -> Dict[str, Any]:
        """FastAPI Auth Backend"""
        files = {}
        auth_dir = os.path.join(base_path, "auth")

        # Controller mit Login/Register
        files["controller.py"] = f'''# -------------------------------------------------------------
# FastAPI Auth Controller
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from .jwt_utils import create_token, verify_token
from .models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# Temporäre In-Memory DB (in Produktion: echte DB verwenden)
fake_db = {{}}


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
async def register(data: RegisterRequest):
    """Registriert neuen User"""
    if data.email in fake_db:
        raise HTTPException(status_code=400, detail="User existiert bereits")
    
    # In Produktion: Password hashen (bcrypt)
    fake_db[data.email] = {{
        "email": data.email,
        "password": data.password,
        "name": data.name
    }}
    
    return {{"success": True, "message": "User erstellt"}}


@router.post("/login")
async def login(data: LoginRequest):
    """Login und Token-Generierung"""
    user = fake_db.get(data.email)
    
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    token = create_token(data.email)
    
    return {{
        "success": True,
        "token": token,
        "user": {{
            "email": user["email"],
            "name": user.get("name")
        }}
    }}


@router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    """Passwort zurücksetzen"""
    if email not in fake_db:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    
    # In Produktion: Email mit Reset-Link senden
    return {{"success": True, "message": "Reset-Link gesendet"}}


@router.get("/me")
async def get_current_user(token: str):
    """Aktuellen User abrufen"""
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Ungültiger Token")
    
    email = payload.get("email")
    user = fake_db.get(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User nicht gefunden")
    
    return {{
        "email": user["email"],
        "name": user.get("name")
    }}
'''

        # JWT Utils
        files["jwt_utils.py"] = f'''# -------------------------------------------------------------
# JWT Token Utils
# -------------------------------------------------------------
import jwt
import time
from typing import Optional, Dict

SECRET = "{jwt_secret}"
ALGORITHM = "HS256"
TOKEN_EXPIRE_SECONDS = {session_timeout}


def create_token(email: str) -> str:
    """Erstellt JWT Token"""
    payload = {{
        "email": email,
        "exp": time.time() + TOKEN_EXPIRE_SECONDS,
        "iat": time.time()
    }}
    
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[Dict]:
    """Verifiziert JWT Token"""
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
'''

        # Models
        files["models.py"] = '''# -------------------------------------------------------------
# Auth Models
# -------------------------------------------------------------
from pydantic import BaseModel, EmailStr
from typing import Optional


class User(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str  # In Produktion: gehashed


class UserResponse(BaseModel):
    email: EmailStr
    name: Optional[str] = None
'''

        # Requirements
        files["requirements.txt"] = '''fastapi
pydantic[email]
pyjwt
bcrypt
'''

        # Dateien schreiben
        os.makedirs(auth_dir, exist_ok=True)
        
        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(auth_dir, filename)
            with open(filepath, "w") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "fastapi",
            "files": created_files,
            "endpoints": ["/auth/register", "/auth/login", "/auth/forgot-password", "/auth/me"],
            "features": ["JWT", "Email Validation", "Session Handling"]
        }

    def _generate_nodejs_backend(self, base_path: str, jwt_secret: str, session_timeout: int) -> Dict[str, Any]:
        """Node.js/Express Auth Backend"""
        files = {}
        auth_dir = os.path.join(base_path, "auth")

        files["authController.js"] = f'''// -------------------------------------------------------------
// Node.js Auth Controller
// -------------------------------------------------------------
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = '{jwt_secret}';
const EXPIRE = '{session_timeout}s';

const fakeDB = {{}};

exports.register = async (req, res) => {{
  const {{ email, password, name }} = req.body;
  
  if (fakeDB[email]) {{
    return res.status(400).json({{ error: 'User existiert bereits' }});
  }}
  
  const hashedPassword = await bcrypt.hash(password, 10);
  fakeDB[email] = {{ email, password: hashedPassword, name }};
  
  res.json({{ success: true, message: 'User erstellt' }});
}};

exports.login = async (req, res) => {{
  const {{ email, password }} = req.body;
  const user = fakeDB[email];
  
  if (!user || !(await bcrypt.compare(password, user.password))) {{
    return res.status(401).json({{ error: 'Ungültige Anmeldedaten' }});
  }}
  
  const token = jwt.sign({{ email }}, SECRET, {{ expiresIn: EXPIRE }});
  
  res.json({{ success: true, token, user: {{ email, name: user.name }} }});
}};

exports.forgotPassword = async (req, res) => {{
  const {{ email }} = req.body;
  
  if (!fakeDB[email]) {{
    return res.status(404).json({{ error: 'User nicht gefunden' }});
  }}
  
  res.json({{ success: true, message: 'Reset-Link gesendet' }});
}};
'''

        files["authRoutes.js"] = '''// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
const express = require('express');
const router = express.Router();
const authController = require('./authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
'''

        files["package.json"] = '''{
  "dependencies": {
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0"
  }
}
'''

        os.makedirs(auth_dir, exist_ok=True)
        
        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(auth_dir, filename)
            with open(filepath, "w") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "nodejs",
            "files": created_files,
            "endpoints": ["/auth/register", "/auth/login", "/auth/forgot-password"]
        }

    def _generate_django_backend(self, base_path: str, jwt_secret: str, session_timeout: int) -> Dict[str, Any]:
        """Django Auth Backend"""
        return {
            "success": False,
            "error": "Django Backend kommt in nächster Version"
        }

    def generate_frontend_ui(self, framework: str, base_path: str, style: str = "material") -> Dict[str, Any]:
        """
        Generiert Frontend Auth UI
        
        Args:
            framework: flutter, react, nextjs, vue
            base_path: Ziel-Verzeichnis
            style: material, cupertino, custom
        
        Returns:
            Dict mit success, files, framework, screens
        """
        if framework not in self.supported_frontends:
            return {
                "success": False,
                "error": f"Framework '{framework}' nicht unterstützt. Verfügbar: {self.supported_frontends}"
            }

        if framework == "flutter":
            return self._generate_flutter_ui(base_path, style)
        elif framework == "react":
            return self._generate_react_ui(base_path, style)
        elif framework == "nextjs":
            return self._generate_nextjs_ui(base_path, style)
        elif framework == "vue":
            return self._generate_vue_ui(base_path, style)

    def _generate_flutter_ui(self, base_path: str, style: str) -> Dict[str, Any]:
        """Flutter Auth UI"""
        files = {}
        screens_dir = os.path.join(base_path, "lib", "screens", "auth")

        files["login_screen.dart"] = '''// -------------------------------------------------------------
// Flutter Login Screen
// -------------------------------------------------------------
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Willkommen zurück',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 40),
              
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Passwort',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
              ),
              SizedBox(height: 8),
              
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: Text('Passwort vergessen?'),
                ),
              ),
              SizedBox(height: 24),
              
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? CircularProgressIndicator()
                    : Text('Login', style: TextStyle(fontSize: 18)),
              ),
              SizedBox(height: 16),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Noch kein Account?'),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/signup');
                    },
                    child: Text('Registrieren'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLogin() async {
    setState(() => _isLoading = true);
    
    // API Call hier
    await Future.delayed(Duration(seconds: 1));
    
    setState(() => _isLoading = false);
    Navigator.pushReplacementNamed(context, '/home');
  }
}
'''

        files["signup_screen.dart"] = '''// -------------------------------------------------------------
// Flutter Signup Screen
// -------------------------------------------------------------
import 'package:flutter/material.dart';

class SignupScreen extends StatefulWidget {
  @override
  _SignupScreenState createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Registrieren')),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Account erstellen',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 40),
              
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
              ),
              SizedBox(height: 16),
              
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Passwort',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
              ),
              SizedBox(height: 24),
              
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSignup,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? CircularProgressIndicator()
                    : Text('Account erstellen', style: TextStyle(fontSize: 18)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleSignup() async {
    setState(() => _isLoading = true);
    
    // API Call hier
    await Future.delayed(Duration(seconds: 1));
    
    setState(() => _isLoading = false);
    Navigator.pushReplacementNamed(context, '/home');
  }
}
'''

        files["forgot_password_screen.dart"] = '''// -------------------------------------------------------------
// Flutter Forgot Password Screen
// -------------------------------------------------------------
import 'package:flutter/material.dart';

class ForgotPasswordScreen extends StatefulWidget {
  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Passwort zurücksetzen')),
      body: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_reset, size: 80, color: Colors.blue),
            SizedBox(height: 24),
            
            Text(
              'Passwort vergessen?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            
            Text(
              'Gib deine Email ein und wir senden dir einen Reset-Link.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            SizedBox(height: 32),
            
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 24),
            
            ElevatedButton(
              onPressed: _isLoading ? null : _handleReset,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16, horizontal: 48),
              ),
              child: _isLoading
                  ? CircularProgressIndicator()
                  : Text('Reset-Link senden'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleReset() async {
    setState(() => _isLoading = true);
    
    await Future.delayed(Duration(seconds: 1));
    
    setState(() => _isLoading = false);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Reset-Link wurde gesendet!')),
    );
    
    Navigator.pop(context);
  }
}
'''

        os.makedirs(screens_dir, exist_ok=True)
        
        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(screens_dir, filename)
            with open(filepath, "w") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "flutter",
            "files": created_files,
            "screens": ["LoginScreen", "SignupScreen", "ForgotPasswordScreen"]
        }

    def _generate_react_ui(self, base_path: str, style: str) -> Dict[str, Any]:
        """React Auth UI"""
        files = {}
        pages_dir = os.path.join(base_path, "src", "pages", "auth")

        files["Login.jsx"] = '''// -------------------------------------------------------------
// React Login Page
// -------------------------------------------------------------
import { useState } from 'react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // API Call hier
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    window.location.href = '/dashboard';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Willkommen zurück</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="forgot-link">
            <a href="/forgot-password">Passwort vergessen?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Laden...' : 'Login'}
          </button>

          <p className="signup-link">
            Noch kein Account? <a href="/signup">Registrieren</a>
          </p>
        </form>
      </div>
    </div>
  );
}
'''

        files["Signup.jsx"] = '''// -------------------------------------------------------------
// React Signup Page
// -------------------------------------------------------------
import { useState } from 'react';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // API Call hier
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    window.location.href = '/dashboard';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Account erstellen</h1>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Laden...' : 'Account erstellen'}
          </button>

          <p className="signup-link">
            Bereits registriert? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
'''

        files["Auth.css"] = '''.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.auth-card h1 {
  margin: 0 0 30px 0;
  font-size: 28px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.forgot-link {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}
'''

        os.makedirs(pages_dir, exist_ok=True)
        
        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(pages_dir, filename)
            with open(filepath, "w") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "react",
            "files": created_files,
            "screens": ["Login", "Signup"]
        }

    def _generate_nextjs_ui(self, base_path: str, style: str) -> Dict[str, Any]:
        """Next.js Auth UI (App Router)"""
        files = {}
        
        # Next.js 14 App Router Structure
        files["app/(auth)/login/page.jsx"] = '''// -------------------------------------------------------------
// Next.js Login Page
// -------------------------------------------------------------
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // API Call
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    setLoading(false);
    
    if (res.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Willkommen zurück</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Laden...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
'''

        files["app/(auth)/signup/page.jsx"] = '''// -------------------------------------------------------------
// Next.js Signup Page
// -------------------------------------------------------------
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      router.push('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Account erstellen</h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit">Account erstellen</button>
        </form>
      </div>
    </div>
  );
}
'''

        auth_dir = os.path.join(base_path, "app", "(auth)")
        os.makedirs(os.path.join(auth_dir, "login"), exist_ok=True)
        os.makedirs(os.path.join(auth_dir, "signup"), exist_ok=True)
        
        created_files = []
        for filepath_key, content in files.items():
            filepath = os.path.join(base_path, filepath_key)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "nextjs",
            "files": created_files,
            "screens": ["Login", "Signup"]
        }

    def _generate_vue_ui(self, base_path: str, style: str) -> Dict[str, Any]:
        """Vue 3 Auth UI"""
        return {
            "success": False,
            "error": "Vue UI kommt in nächster Version"
        }


auth_generator = AuthGenerator()
