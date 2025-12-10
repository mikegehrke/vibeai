// VibeAI App Builder - Start Page
// Platform Selection + AI Prompt Generator
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function AppBuilderStart() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=Platform, 2=Prompt, 3=Generate
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [userIdea, setUserIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [progress, setProgress] = useState('');
  const chatEndRef = useRef(null);

  // ALLE verfügbaren Plattformen und Frameworks
  const PLATFORMS = [
    // MOBILE APPS
    {
      id: 'flutter',
      name: 'Flutter',
      icon: '📱',
      category: 'Mobile',
      description: 'Cross-Platform Mobile App',
      platforms: ['iOS', 'Android', 'Web'],
      language: 'Dart',
      bestFor: 'Apps die auf iOS, Android UND Web laufen sollen',
      examples: ['E-Commerce App', 'Social Media', 'Fitness Tracker', 'Dating App']
    },
    {
      id: 'react-native',
      name: 'React Native',
      icon: '📱',
      category: 'Mobile',
      description: 'Mobile App mit JavaScript',
      platforms: ['iOS', 'Android'],
      language: 'TypeScript/JavaScript',
      bestFor: 'Mobile Apps mit Web-Technologien',
      examples: ['Delivery App', 'Chat App', 'News Reader', 'Shopping App']
    },
    {
      id: 'ios-swift',
      name: 'iOS Native',
      icon: '🍎',
      category: 'Mobile',
      description: 'Native iOS App',
      platforms: ['iOS'],
      language: 'Swift + SwiftUI',
      bestFor: 'Reine iOS Apps mit bester Performance',
      examples: ['iPhone App', 'iPad App', 'Apple Watch App']
    },
    {
      id: 'android-kotlin',
      name: 'Android Native',
      icon: '🤖',
      category: 'Mobile',
      description: 'Native Android App',
      platforms: ['Android'],
      language: 'Kotlin + Jetpack Compose',
      bestFor: 'Reine Android Apps mit bester Performance',
      examples: ['Android App', 'Tablet App', 'Wear OS App']
    },
    
    // WEB APPS
    {
      id: 'nextjs',
      name: 'Next.js',
      icon: '🌐',
      category: 'Web & Full-Stack',
      description: 'Full-Stack Web App',
      platforms: ['Web', 'Desktop (PWA)'],
      language: 'TypeScript/React',
      bestFor: 'Moderne Web-Apps mit Frontend + Backend',
      examples: ['SaaS Platform', 'Dashboard', 'Blog', 'E-Commerce Website']
    },
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      category: 'Web Frontend',
      description: 'Frontend Web App',
      platforms: ['Web'],
      language: 'TypeScript/React',
      bestFor: 'Reine Frontend Web-Anwendungen',
      examples: ['Landing Page', 'Portfolio', 'Admin Panel', 'Web App']
    },
    {
      id: 'vue',
      name: 'Vue.js',
      icon: '💚',
      category: 'Web Frontend',
      description: 'Vue.js Web App',
      platforms: ['Web'],
      language: 'TypeScript/Vue',
      bestFor: 'Progressive Web Apps, einfache Entwicklung',
      examples: ['Landing Page', 'Dashboard', 'SPA', 'Progressive Web App']
    },
    {
      id: 'angular',
      name: 'Angular',
      icon: '🅰️',
      category: 'Web Frontend',
      description: 'Angular Enterprise Web App',
      platforms: ['Web'],
      language: 'TypeScript',
      bestFor: 'Enterprise Web Apps, große Anwendungen',
      examples: ['Enterprise Dashboard', 'Banking App', 'CRM System', 'Admin Portal']
    },
    {
      id: 'svelte',
      name: 'Svelte',
      icon: '🧡',
      category: 'Web Frontend',
      description: 'Svelte Web App',
      platforms: ['Web'],
      language: 'TypeScript/Svelte',
      bestFor: 'Schnelle, schlanke Web Apps',
      examples: ['Interactive Website', 'Web Game', 'Portfolio', 'Blog']
    },

    // BACKEND APIS
    {
      id: 'nodejs',
      name: 'Node.js/Express',
      icon: '🟢',
      category: 'Backend',
      description: 'Node.js Backend API',
      platforms: ['Server'],
      language: 'JavaScript/TypeScript',
      bestFor: 'REST APIs, WebSocket Server, Microservices',
      examples: ['REST API', 'GraphQL Server', 'WebSocket Chat', 'Auth Service']
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      icon: '⚡',
      category: 'Backend',
      description: 'Python Backend API',
      platforms: ['Server'],
      language: 'Python',
      bestFor: 'Schnelle Python APIs, ML Integration',
      examples: ['ML API', 'Data Processing', 'Backend Service', 'AI API']
    },
    {
      id: 'python-flask',
      name: 'Flask',
      icon: '🐍',
      category: 'Backend',
      description: 'Python Flask API',
      platforms: ['Server'],
      language: 'Python',
      bestFor: 'Einfache Python APIs, Prototyping',
      examples: ['REST API', 'Web Service', 'Microservice', 'Simple API']
    },
    {
      id: 'python-django',
      name: 'Django',
      icon: '🎸',
      category: 'Backend',
      description: 'Python Django Full-Stack',
      platforms: ['Server'],
      language: 'Python',
      bestFor: 'Full-Stack Python Apps, Admin Panels',
      examples: ['CMS System', 'Admin Dashboard', 'Blog Platform', 'E-Commerce']
    },
    {
      id: 'spring-boot',
      name: 'Spring Boot',
      icon: '🍃',
      category: 'Backend',
      description: 'Java Spring Boot API',
      platforms: ['Server'],
      language: 'Java/Kotlin',
      bestFor: 'Enterprise Java APIs, Microservices',
      examples: ['Enterprise API', 'Banking Service', 'Microservice', 'Business Logic']
    },
    {
      id: 'laravel',
      name: 'Laravel',
      icon: '🎨',
      category: 'Backend',
      description: 'PHP Laravel Full-Stack',
      platforms: ['Server'],
      language: 'PHP',
      bestFor: 'PHP Web Applications, CMS',
      examples: ['CMS', 'E-Commerce', 'Web Portal', 'Admin System']
    },
    {
      id: 'rails',
      name: 'Ruby on Rails',
      icon: '💎',
      category: 'Backend',
      description: 'Ruby on Rails Full-Stack',
      platforms: ['Server'],
      language: 'Ruby',
      bestFor: 'Rapid Web Development, MVP',
      examples: ['Startup MVP', 'Social Platform', 'SaaS Tool', 'Web Portal']
    },
    {
      id: 'dotnet',
      name: '.NET Core',
      icon: '🟣',
      category: 'Backend',
      description: 'C# .NET Core API',
      platforms: ['Server'],
      language: 'C#',
      bestFor: 'Enterprise APIs, Windows Integration',
      examples: ['Enterprise API', 'Windows Service', 'Business API', 'Corporate Tool']
    },
    {
      id: 'go-gin',
      name: 'Go/Gin',
      icon: '🐹',
      category: 'Backend',
      description: 'Go Backend API',
      platforms: ['Server'],
      language: 'Go',
      bestFor: 'High-Performance APIs, Cloud Native',
      examples: ['Microservice', 'Cloud API', 'High-Traffic Service', 'DevOps Tool']
    },
    {
      id: 'rust-actix',
      name: 'Rust/Actix',
      icon: '🦀',
      category: 'Backend',
      description: 'Rust Backend API',
      platforms: ['Server'],
      language: 'Rust',
      bestFor: 'Ultra-High Performance, System Programming',
      examples: ['High-Performance API', 'System Service', 'Real-time Service', 'IoT Backend']
    },

    // GAME DEVELOPMENT
    {
      id: 'unity',
      name: 'Unity',
      icon: '🎮',
      category: 'Game Development',
      description: 'Unity Game Engine',
      platforms: ['PC', 'Mobile', 'Console', 'VR/AR'],
      language: 'C#',
      bestFor: '3D/2D Games, VR/AR Apps',
      examples: ['Mobile Game', '3D Game', 'VR Experience', 'AR App']
    },
    {
      id: 'unreal',
      name: 'Unreal Engine',
      icon: '🎭',
      category: 'Game Development',
      description: 'Unreal Engine Game',
      platforms: ['PC', 'Console', 'Mobile'],
      language: 'C++/Blueprint',
      bestFor: 'High-End 3D Games, AAA Games',
      examples: ['AAA Game', 'Racing Game', 'Shooter', 'Adventure Game']
    },
    {
      id: 'godot',
      name: 'Godot',
      icon: '🎯',
      category: 'Game Development',
      description: 'Godot Game Engine',
      platforms: ['PC', 'Mobile', 'Web'],
      language: 'GDScript/C#',
      bestFor: 'Indie Games, Open Source Games',
      examples: ['Indie Game', '2D Platformer', 'Puzzle Game', 'Arcade Game']
    }
  ];

  // AI Prompt Generator
  const generatePrompt = async () => {
    if (!userIdea.trim() || !selectedPlatform) {
      alert('Bitte gib eine App-Idee ein und wähle eine Plattform!');
      return;
    }

    setIsGeneratingPrompt(true);
    setGeneratedPrompt('');

    try {
      console.log('🚀 Starting prompt generation...');
      console.log('User Idea:', userIdea);
      console.log('Platform:', selectedPlatform);

      // Check if backend is available
      try {
        const healthCheck = await fetch('http://localhost:8005/health', { method: 'GET' });
        if (!healthCheck.ok) {
          throw new Error('Backend nicht erreichbar. Bitte starte das Backend.');
        }
      } catch (e) {
        throw new Error('Backend nicht erreichbar. Bitte starte das Backend auf Port 8005.');
      }

      const requestBody = {
        model: 'gpt-4o',
        prompt: `Du bist ein Expert Prompt Generator für App-Entwicklung.

USER IDEE: "${userIdea}"
GEWÄHLTE PLATFORM: ${selectedPlatform.name} (${selectedPlatform.language})

Erstelle einen PERFEKTEN, DETAILLIERTEN Prompt für den App Builder Agent, der diese App erstellen soll.

Der Prompt MUSS enthalten:
1. **App Name** - Kreativer, passender Name
2. **Beschreibung** - Was macht die App genau?
3. **Features** - Liste alle Hauptfunktionen (mindestens 5-8)
4. **UI/UX** - Design-Vorgaben, Farben, Style
5. **Technische Details** - Welche APIs, Datenbank, Auth?
6. **Bildschirme/Pages** - Alle Screens auflisten
7. **Datenmodelle** - Welche Daten werden gespeichert?
8. **Integration** - Externe Services? (Maps, Payment, etc.)

Schreibe den Prompt professionell, präzise und VOLLSTÄNDIG.
Der App Builder muss damit eine KOMPLETT lauffähige App bauen können.

FORMAT:
\`\`\`
APP BUILDER PROMPT:

[Dein generierter Prompt hier]
\`\`\``,
        agent: 'aura',
        conversation_history: [],
        system_prompt: 'Du bist ein Expert Prompt Generator für App-Entwicklung.'
      };

      console.log('📤 Sending request to:', 'http://localhost:8005/api/chat');
      
      const res = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', res.status, res.statusText);

      if (!res.ok) {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (e) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${res.statusText}\n${errorText}`);
        }
        throw new Error(errorData.detail || errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Received response:', data);
      
      // Handle different response formats
      let promptText = '';
      if (data.response) {
        promptText = data.response;
      } else if (data.success && data.data) {
        promptText = data.data;
      } else if (data.content) {
        promptText = data.content;
      } else if (typeof data === 'string') {
        promptText = data;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Ungültige Antwort vom Server. Bitte prüfe die Backend-Verbindung.');
      }
      
      if (!promptText || promptText.trim().length === 0) {
        throw new Error('Leere Antwort vom Server erhalten.');
      }
      
      // Extract prompt from markdown code block if present
      const promptMatch = promptText.match(/APP BUILDER PROMPT:\s*([\s\S]*?)(?:```|$)/i);
      if (promptMatch) {
        setGeneratedPrompt(promptMatch[1].trim());
      } else {
        // Try to extract from any code block
        const codeBlockMatch = promptText.match(/```[\s\S]*?APP BUILDER PROMPT:\s*([\s\S]*?)```/i);
        if (codeBlockMatch) {
          setGeneratedPrompt(codeBlockMatch[1].trim());
        } else {
          setGeneratedPrompt(promptText.trim());
        }
      }
      
      setStep(3);
      setIsGeneratingPrompt(false);
      
      // Scroll to generated prompt
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error('❌ Prompt generation error:', err);
      const errorMessage = err.message || 'Unbekannter Fehler';
      setGeneratedPrompt(`❌ Fehler beim Generieren des Prompts:\n\n${errorMessage}\n\nBitte:\n1. Prüfe ob das Backend läuft (http://localhost:8005)\n2. Prüfe die Browser-Konsole für Details\n3. Versuche es erneut`);
      setIsGeneratingPrompt(false);
      
      // Show alert for user feedback
      alert(`Fehler: ${errorMessage}\n\nBitte prüfe die Browser-Konsole (F12) für Details.`);
    }
  };

  // App Builder starten - LIVE mit sofortiger Navigation zum Editor
  const createProject = async () => {
    if (!selectedPlatform) {
      setProgress('❌ Bitte wähle eine Plattform!');
      return;
    }

    setIsCreatingProject(true);
    setProgress('🚀 Starte App-Generierung...');

    try {
      // Extract prompt from markdown code block OR use userIdea as fallback
      let finalPrompt = userIdea;
      if (generatedPrompt) {
        const promptMatch = generatedPrompt.match(/APP BUILDER PROMPT:\s*([\s\S]*?)(?:```|$)/);
        finalPrompt = promptMatch ? promptMatch[1].trim() : generatedPrompt;
      }

      // Map frontend platform IDs to backend framework names
      const frameworkMapping = {
        // Mobile
        'flutter': 'flutter',
        'react-native': 'react',
        'ios-swift': 'ios-swift',
        'android-kotlin': 'android-kotlin',
        
        // Web Frontend
        'nextjs': 'nextjs', 
        'react': 'react',
        'vue': 'vue',
        'angular': 'angular',
        'svelte': 'react', // Fallback to react for now
        
        // Backend
        'nodejs': 'node',
        'fastapi': 'fastapi',
        'python-flask': 'python-flask',
        'python-django': 'python-django',
        'spring-boot': 'react', // Fallback for now
        'laravel': 'react', // Fallback for now
        'rails': 'react', // Fallback for now
        'dotnet': 'react', // Fallback for now
        'go-gin': 'react', // Fallback for now
        'rust-actix': 'react', // Fallback for now
        
        // Game Development
        'unity': 'react', // Fallback for now
        'unreal': 'react', // Fallback for now
        'godot': 'react' // Fallback for now
      };

      const backendFramework = frameworkMapping[selectedPlatform.id] || 'react';
      const projectName = userIdea.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '-');
      const projectId = projectName.toLowerCase().replace(/\s+/g, '-');

      // SOFORT zum Editor navigieren - Live-Updates werden dort empfangen
      // Speichere Build-Parameter für den Editor
      localStorage.setItem(`build_${projectId}_params`, JSON.stringify({
        project_name: projectName,
        project_type: backendFramework,
        description: finalPrompt,
        platform: selectedPlatform.id
      }));

      // Navigiere sofort zum Editor
      router.push(`/builder/${projectId}?live_build=true`);

    } catch (err) {
      console.error('❌ Project creation error:', err);
      const errorMessage = err.message || 'Unbekannter Fehler beim Erstellen des Projekts';
      setProgress(`❌ Fehler: ${errorMessage}`);
      setIsCreatingProject(false);
      
      // Show detailed error to user
      alert(`Fehler beim Erstellen der App:\n\n${errorMessage}\n\nBitte:\n1. Prüfe die Browser-Konsole (F12) für Details\n2. Stelle sicher, dass das Backend läuft\n3. Prüfe ob OpenAI API Key konfiguriert ist`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 40px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ color: '#0098ff', textDecoration: 'none', fontSize: '18px' }}>
          ← Zurück
        </Link>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          🏗️ VibeAI App Builder
        </h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* Steps Indicator */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {[
          { num: 1, label: 'Platform wählen' },
          { num: 2, label: 'Idee beschreiben' },
          { num: 3, label: 'App erstellen' }
        ].map((s, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: step >= s.num ? 1 : 0.4
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step >= s.num ? '#0098ff' : 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {s.num}
            </div>
            <span style={{ fontSize: '14px' }}>{s.label}</span>
            {idx < 2 && <span style={{ margin: '0 10px', opacity: 0.3 }}>→</span>}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '40px auto',
        padding: '0 20px'
      }}>

        {/* STEP 1: Platform Selection */}
        {step === 1 && (
          <>
            <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '40px' }}>
              📱 Wähle deine Platform
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatform(platform);
                    setStep(2);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: selectedPlatform?.id === platform.id
                      ? '2px solid #0098ff'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    ':hover': { transform: 'translateY(-5px)' }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {platform.icon}
                  </div>

                  <h3 style={{ fontSize: '22px', marginBottom: '8px', color: '#0098ff' }}>
                    {platform.name}
                  </h3>

                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(0, 152, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    marginBottom: '16px'
                  }}>
                    {platform.category}
                  </div>

                  <p style={{ opacity: 0.8, marginBottom: '16px', fontSize: '14px' }}>
                    {platform.description}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>
                      📦 Platforms:
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {platform.platforms.join(', ')}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>
                      💻 Sprache:
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {platform.language}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>
                      ✨ Perfekt für:
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      {platform.bestFor}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '8px' }}>
                      💡 Beispiele:
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {platform.examples.map((ex, idx) => (
                        <span key={idx} style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px'
                        }}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: User Idea Input */}
        {step === 2 && selectedPlatform && (
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                {selectedPlatform.icon}
              </div>
              <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>
                {selectedPlatform.name}
              </h2>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>
                {selectedPlatform.platforms.join(' + ')} • {selectedPlatform.language}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                💡 Beschreibe deine App-Idee:
              </label>
              <textarea
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                placeholder={`Beispiel: "Ich möchte eine ${selectedPlatform.examples[0]} erstellen, die..."\n\nSchreibe einfach was du willst - die AI macht daraus einen perfekten Prompt!`}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <div style={{
                marginTop: '12px',
                fontSize: '13px',
                opacity: 0.6
              }}>
                💡 Tipp: Je detaillierter deine Beschreibung, desto besser wird die App!
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ← Platform wechseln
              </button>
              <button
                onClick={generatePrompt}
                disabled={!userIdea.trim() || isGeneratingPrompt}
                style={{
                  flex: 2,
                  padding: '16px',
                  background: !userIdea.trim() || isGeneratingPrompt
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #0098ff 0%, #00d4ff 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: !userIdea.trim() || isGeneratingPrompt ? 'not-allowed' : 'pointer',
                  opacity: !userIdea.trim() || isGeneratingPrompt ? 0.5 : 1
                }}
              >
                {isGeneratingPrompt ? '🤖 AI generiert Prompt...' : '🚀 Prompt generieren'}
              </button>

              {/* Direct Create Button */}
              <button
                onClick={createProject}
                disabled={!userIdea.trim() || isCreatingProject}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: !userIdea.trim() || isCreatingProject
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: !userIdea.trim() || isCreatingProject ? 'not-allowed' : 'pointer',
                  opacity: !userIdea.trim() || isCreatingProject ? 0.5 : 1
                }}
                title="Direkt App erstellen ohne Prompt-Generierung"
              >
                ⚡ Direkt erstellen
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Generated Prompt & Create */}
        {step === 3 && generatedPrompt && (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '24px',
              marginBottom: '32px'
            }}>
              ✨ Generierter Prompt für {selectedPlatform.name}
            </h2>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                fontSize: '14px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                maxHeight: '500px',
                overflowY: 'auto',
                fontFamily: '"Fira Code", monospace'
              }}>
                {generatedPrompt}
              </div>
              <div ref={chatEndRef} />
            </div>

            {progress && (
              <div style={{
                background: isCreatingProject
                  ? 'linear-gradient(90deg, rgba(0, 152, 255, 0.3) 0%, rgba(0, 212, 255, 0.3) 50%, rgba(0, 152, 255, 0.3) 100%)'
                  : progress.includes('✅')
                    ? 'rgba(0, 208, 132, 0.2)'
                    : 'rgba(255, 107, 107, 0.2)',
                border: `2px solid ${isCreatingProject
                    ? '#0098ff'
                    : progress.includes('✅')
                      ? '#00d084'
                      : '#ff6b6b'
                  }`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden',
                backgroundSize: '200% 100%',
                animation: isCreatingProject ? 'shimmer 2s infinite linear' : 'none'
              }}>
                {isCreatingProject && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '4px solid #0098ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px'
                  }}></div>
                )}
                {progress}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <button
                onClick={() => {
                  setStep(2);
                  setGeneratedPrompt('');
                }}
                disabled={isCreatingProject}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isCreatingProject ? 'not-allowed' : 'pointer',
                  opacity: isCreatingProject ? 0.5 : 1
                }}
              >
                ← Prompt ändern
              </button>

              {/* Quick Test Button */}
              <button
                onClick={() => {
                  setUserIdea('Test App mit Login und Dashboard');
                  createProject();
                }}
                disabled={isCreatingProject}
                style={{
                  padding: '16px',
                  background: 'rgba(255, 165, 0, 0.2)',
                  border: '1px solid rgba(255, 165, 0, 0.5)',
                  borderRadius: '12px',
                  color: 'orange',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: isCreatingProject ? 'not-allowed' : 'pointer',
                  opacity: isCreatingProject ? 0.5 : 1
                }}
                title="Quick Test - Erstellt sofort eine Test-App"
              >
                🧪 Quick Test
              </button>

              <button
                onClick={createProject}
                disabled={isCreatingProject}
                style={{
                  flex: 2,
                  padding: '16px',
                  background: isCreatingProject
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isCreatingProject ? 'not-allowed' : 'pointer',
                  opacity: isCreatingProject ? 0.6 : 1
                }}
              >
                {isCreatingProject ? '⏳ Erstelle App...' : '🚀 App jetzt erstellen!'}
              </button>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(0, 255, 135, 0.1)',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ff87' }}>
                ℹ️ Was passiert als Nächstes:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Der App Builder Agent erstellt ALLE Dateien basierend auf diesem Prompt</li>
                <li>Vollständige Projektstruktur mit allen Screens/Pages</li>
                <li>Kompletter, lauffähiger Code in {selectedPlatform.language}</li>
                <li>Live Preview zum sofortigen Testen</li>
                <li>AI Assistant hilft dir beim Anpassen</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
