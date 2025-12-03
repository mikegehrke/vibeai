import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './CodeStudio.css';
import { FiPlay, FiDownload, FiFolder, FiFile, FiUpload, FiTerminal, FiEye, FiSettings, FiPlusCircle, FiTrash2, FiCode, FiCpu, FiMessageSquare, FiPackage, FiEyeOff, FiLayout } from 'react-icons/fi';
import PromptHelper from './PromptHelper';

const CodeStudio = () => {
  const [files, setFiles] = useState([]);
  
  const [activeFile, setActiveFile] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState(['🚀 VibeAI Code Studio - Ready!', '']);
  const [projectName, setProjectName] = useState('my-project');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('qwen2.5-coder:7b');
  const [availableModels, setAvailableModels] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPromptHelper, setShowPromptHelper] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [projectTemplate, setProjectTemplate] = useState('web');
  const [selectedAgent, setSelectedAgent] = useState('devra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [aiChatPosition, setAiChatPosition] = useState({ x: window.innerWidth - 470, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const terminalInputRef = useRef(null);
  const aiChatRef = useRef(null);

  // Drag functionality for AI Chat
  const handleMouseDown = (e) => {
    if (e.target.closest('.ai-chat-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - aiChatPosition.x,
        y: e.clientY - aiChatPosition.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setAiChatPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Alle 280+ Modelle laden
  useEffect(() => {
    fetch('http://localhost:8005/api/models/available')
      .then(res => res.json())
      .then(models => {
        setAvailableModels(models);
        console.log(`✅ ${models.length} Modelle geladen`);
      })
      .catch(err => {
        console.error('Fehler beim Laden der Modelle:', err);
        // Fallback Modelle
        setAvailableModels([
          { id: 'gpt-5.1-turbo', name: 'GPT-5.1 Turbo', category: 'premium' },
          { id: 'gpt-4o', name: 'GPT-4o', category: 'multimodal' },
          { id: 'claude-4.5-opus', name: 'Claude 4.5 Opus', category: 'premium' },
          { id: 'gemini-3-pro', name: 'Gemini 3 Pro', category: 'multimodal' }
        ]);
      });
  }, []);

  // Initialize with welcome screen
  useEffect(() => {
    if (files.length === 0) {
      const welcomeFiles = [
        { 
          id: Date.now(), 
          name: 'README.md', 
          language: 'markdown', 
          content: `# 🚀 VibeAI Code Studio

Willkommen im ultimativen Code Studio!

## 🎯 Schnellstart

1. **📝 Prompt Helper öffnen** - Klicke auf den Button rechts
2. **🤖 AI Chat starten** - Lass dir eine komplette App generieren
3. **⚡ Quick Start** - Wähle ein Template: React, Flutter, Python, etc.

## 💡 Features

- 280+ AI Models verfügbar
- Automatische App-Generierung
- Live Preview für Web Apps
- Terminal Integration
- Alle Tech-Stacks: React, Next.js, Flutter, Python, Swift, Kotlin...

## 🔥 Starte jetzt!

Nutze den **AI Chat Agent** um eine komplette App zu generieren:
- "Erstelle eine Todo-App mit React"
- "Entwickle einen Online-Shop mit Next.js und Stripe"
- "Mach eine Flutter App mit Firebase"

Der Agent erstellt ALLE Dateien automatisch! 🚀
`
        }
      ];
      setFiles(welcomeFiles);
      setActiveFile(welcomeFiles[0]);
    }
  }, []);

  // Live Preview Update
  useEffect(() => {
    if (showPreview && previewRef.current) {
      const htmlFile = files.find(f => f.language === 'html');
      const cssFile = files.find(f => f.language === 'css');
      const jsFile = files.find(f => f.language === 'javascript');
      
      const previewContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${cssFile ? cssFile.content : ''}</style>
        </head>
        <body>
          ${htmlFile ? htmlFile.content.replace(/<!DOCTYPE html>|<html.*?>|<\/html>|<head>.*?<\/head>|<body>|<\/body>/gi, '') : '<h1>No HTML file</h1>'}
          <script>${jsFile ? jsFile.content : ''}</script>
        </body>
        </html>
      `;
      
      const iframe = previewRef.current;
      iframe.srcdoc = previewContent;
    }
  }, [files, showPreview]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Dark Theme aktivieren
    monaco.editor.setTheme('vs-dark');
    
    // Auto-completion aktivieren
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      wordWrap: 'on',
      automaticLayout: true
    });
  };

  const handleEditorChange = (value) => {
    if (activeFile) {
      setFiles(files.map(f => 
        f.id === activeFile.id ? { ...f, content: value } : f
      ));
      setActiveFile({ ...activeFile, content: value });
    }
  };

  const createNewFile = () => {
    const fileName = prompt('Dateiname:');
    if (!fileName) return;
    
    const ext = fileName.split('.').pop();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'sh': 'shell'
    };
    
    const newFile = {
      id: Date.now(),
      name: fileName,
      language: languageMap[ext] || 'plaintext',
      content: ''
    };
    
    setFiles([...files, newFile]);
    setActiveFile(newFile);
    addTerminalLine(`✅ Datei erstellt: ${fileName}`);
  };

  const deleteFile = (fileId) => {
    if (files.length === 1) {
      addTerminalLine('❌ Mindestens eine Datei muss vorhanden sein');
      return;
    }
    
    const fileToDelete = files.find(f => f.id === fileId);
    setFiles(files.filter(f => f.id !== fileId));
    
    if (activeFile.id === fileId) {
      setActiveFile(files[0]);
    }
    
    addTerminalLine(`🗑️ Datei gelöscht: ${fileToDelete.name}`);
  };

  const runCode = async () => {
    addTerminalLine('🚀 Code wird ausgeführt...');
    
    // HTML/CSS/JS Preview Update
    if (activeFile.language === 'html' || activeFile.language === 'css' || activeFile.language === 'javascript') {
      setShowPreview(true);
      addTerminalLine('✅ Preview aktualisiert');
      return;
    }
    
    // Backend Code Execution
    try {
      const response = await fetch('http://localhost:8005/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language
        })
      });
      
      const result = await response.json();
      
      if (result.output) {
        addTerminalLine('📤 Output:');
        addTerminalLine(result.output);
      }
      
      if (result.error) {
        addTerminalLine(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      addTerminalLine(`❌ Fehler: ${error.message}`);
    }
  };

  const downloadProject = () => {
    const projectData = {
      name: projectName,
      files: files.map(f => ({ name: f.name, content: f.content }))
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();
    
    addTerminalLine(`📥 Projekt heruntergeladen: ${projectName}.json`);
  };

  const importProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setProjectName(data.name || 'imported-project');
          setFiles(data.files.map((f, i) => ({
            ...f,
            id: Date.now() + i,
            language: f.name.split('.').pop()
          })));
          setActiveFile(data.files[0]);
          addTerminalLine(`✅ Projekt importiert: ${data.name}`);
        } catch (error) {
          addTerminalLine(`❌ Import-Fehler: ${error.message}`);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const addTerminalLine = (text) => {
    setTerminalOutput(prev => [...prev, text]);
    setTimeout(() => {
      const terminal = document.querySelector('.terminal-output');
      if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }, 10);
  };

  const handleTerminalCommand = (e) => {
    // Auto-Vervollständigung mit Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = e.target.value;
      const commands = ['ls', 'cat', 'clear', 'help', 'run', 'models', 'mkdir', 'rm', 'echo'];
      const match = commands.find(c => c.startsWith(input));
      if (match) e.target.value = match;
      return;
    }
    
    if (e.key === 'Enter') {
      const command = e.target.value.trim();
      
      if (command) {
        addTerminalLine(`$ ${command}`);
        
        // Command Processing
        if (command === 'clear') {
          setTerminalOutput(['']);
        } else if (command === 'ls') {
          addTerminalLine(files.map(f => f.name).join('  '));
        } else if (command.startsWith('cat ')) {
          const fileName = command.split(' ')[1];
          const file = files.find(f => f.name === fileName);
          if (file) {
            addTerminalLine(file.content);
          } else {
            addTerminalLine(`❌ Datei nicht gefunden: ${fileName}`);
          }
        } else if (command === 'help') {
          addTerminalLine('Verfügbare Befehle: ls, cat <file>, clear, help, run, models');
        } else if (command === 'run') {
          runCode();
        } else if (command === 'models') {
          addTerminalLine(`📊 ${availableModels.length} Modelle verfügbar`);
          addTerminalLine(`Aktiv: ${selectedModel}`);
        } else {
          addTerminalLine(`❌ Befehl nicht gefunden: ${command}`);
        }
      }
      
      e.target.value = '';
    }
  };

  const insertPrompt = (prompt) => {
    // Füge Prompt direkt in AI Chat ein
    setAiChatInput(prompt);
    setShowPromptHelper(false);
    setShowAIChat(true);
  };

  const sendAIMessage = async () => {
    if (!aiChatInput.trim()) return;
    
    const userMessage = { role: 'user', content: aiChatInput };
    setAiChatMessages(prev => [...prev, userMessage]);
    const instruction = aiChatInput;
    setAiChatInput('');
    setIsGenerating(true);
    
    try {
      // Vollständiger Kontext: ALLE Dateien
      const fullContext = files.map(f => `
=== FILE: ${f.name} ===
${f.content}
`).join('\n');
      
      const systemPrompt = `You are a PROFESSIONAL CODING AGENT with expert-level knowledge.

CURRENT PROJECT CONTEXT:
${files.length > 0 ? `Files in project:\n${files.map(f => `- ${f.name} (${f.language}, ${f.content.length} chars)`).join('\n')}\n\nFULL CODE:\n${fullContext}` : 'Empty project - ready to create new app'}

YOUR CAPABILITIES:
✓ Analyze code and understand architecture
✓ Fix bugs and improve code quality
✓ Extend existing files with new features
✓ Create complete, production-ready applications
✓ Follow best practices and modern patterns

RESPONSE FORMAT (STRICT JSON):
\`\`\`json
{
  "explanation": "Brief explanation of what you're doing (in German)",
  "files": [
    {
      "name": "index.html",
      "language": "html",
      "content": "<!DOCTYPE html>...",
      "action": "create"
    },
    {
      "name": "style.css",
      "language": "css",
      "content": "body { margin: 0; }...",
      "action": "create"
    }
  ]
}
\`\`\`

RULES:
1. ALWAYS respond with valid JSON (wrapped in \`\`\`json blocks)
2. Provide COMPLETE file content, not snippets
3. For web apps: Always create index.html + style.css + script.js
4. Use modern, clean code
5. Add helpful comments in German
6. Test your code mentally before responding

USER REQUEST: ${instruction}`;

      setGenerationProgress('🤖 Agent analysiert Anfrage...');
      
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `${systemPrompt}\n\nUSER INSTRUCTION: ${instruction}`,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      let responseText = data.response || data.message || '';
      
      setGenerationProgress('🔍 Verarbeite Antwort...');
      
      // Intelligentes JSON-Parsing: Erst code blocks suchen
      let jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/i);
      if (!jsonMatch) {
        // Fallback: Direktes JSON-Objekt suchen
        jsonMatch = responseText.match(/\{[\s\S]*?"files"[\s\S]*?\]/i);
      }
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const result = JSON.parse(jsonStr);
          
          if (result.files && Array.isArray(result.files)) {
            setGenerationProgress(`📝 ${result.files.length} Dateien werden verarbeitet...`);
            
            // LÖSCHE ALTE DATEIEN - Komplett neu starten
            const newFiles = [];
            
            result.files.forEach((fileData, idx) => {
              const ext = fileData.name.split('.').pop().toLowerCase();
              const languageMap = {
                'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript',
                'ts': 'typescript', 'tsx': 'typescript',
                'py': 'python', 'pyw': 'python',
                'html': 'html', 'htm': 'html',
                'css': 'css', 'scss': 'scss', 'sass': 'sass', 'less': 'less',
                'json': 'json', 'jsonc': 'json',
                'dart': 'dart',
                'swift': 'swift',
                'kt': 'kotlin', 'kts': 'kotlin',
                'java': 'java',
                'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'hpp': 'cpp',
                'c': 'c', 'h': 'c',
                'go': 'go',
                'rs': 'rust',
                'rb': 'ruby',
                'php': 'php',
                'md': 'markdown', 'markdown': 'markdown',
                'yml': 'yaml', 'yaml': 'yaml',
                'xml': 'xml', 'svg': 'xml',
                'sh': 'shell', 'bash': 'shell', 'zsh': 'shell'
              };
              
              const language = fileData.language || languageMap[ext] || 'plaintext';
              
              newFiles.push({
                id: Date.now() + idx,
                name: fileData.name,
                language: language,
                content: fileData.content || ''
              });
              addTerminalLine(`✅ ${fileData.action === 'update' ? 'Aktualisiert' : 'Erstellt'}: ${fileData.name}`);
            });
            
            setFiles(newFiles);
            setActiveFile(newFiles[0]);
            
            // Live Preview Update - SOFORT anzeigen
            const htmlFile = newFiles.find(f => f.name.endsWith('.html') || f.name === 'index.html');
            const hasReactNative = newFiles.some(f => f.name === 'App.tsx' || f.name === 'app.json');
            const hasFlutter = newFiles.some(f => f.name === 'pubspec.yaml' || f.name.endsWith('.dart'));
            
            if (htmlFile) {
              setShowPreview(true);
              
              // CSS und JS in HTML einbetten für Preview
              const cssFile = newFiles.find(f => f.name.endsWith('.css'));
              const jsFile = newFiles.find(f => f.name.endsWith('.js'));
              
              let htmlContent = htmlFile.content;
              
              // CSS einbetten wenn nicht schon im HTML
              if (cssFile && !htmlContent.includes(cssFile.name)) {
                htmlContent = htmlContent.replace(
                  '</head>',
                  `<style>${cssFile.content}</style>\n</head>`
                );
              }
              
              // JS einbetten wenn nicht schon im HTML
              if (jsFile && !htmlContent.includes(jsFile.name)) {
                htmlContent = htmlContent.replace(
                  '</body>',
                  `<script>${jsFile.content}</script>\n</body>`
                );
              }
              
              setTimeout(() => {
                if (previewRef.current) {
                  previewRef.current.srcdoc = htmlContent;
                  addTerminalLine('🌐 Preview aktualisiert');
                }
              }, 200);
            } else if (hasReactNative) {
              addTerminalLine('📱 React Native App erstellt!');
              addTerminalLine('▶️ Zum Testen: npx expo start');
              setShowTerminal(true);
            } else if (hasFlutter) {
              addTerminalLine('🦋 Flutter App erstellt!');
              addTerminalLine('▶️ Zum Testen: flutter run');
              setShowTerminal(true);
            } else if (newFiles.some(f => f.name.endsWith('.py'))) {
              addTerminalLine('🐍 Python App erstellt!');
              addTerminalLine('▶️ Zum Testen: python ' + newFiles.find(f => f.name.includes('main') || f.name.includes('app'))?.name);
              setShowTerminal(true);
            }
            
            const aiMessage = { 
              role: 'assistant', 
              content: `✅ ${result.explanation}\n\n📁 ${result.files.length} Dateien verarbeitet:\n${result.files.map(f => `- ${f.name}`).join('\n')}\n\n▶️ Preview geöffnet!` 
            };
            setAiChatMessages(prev => [...prev, aiMessage]);
          }
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          // Fallback: Zeige normale Antwort
          const aiMessage = { role: 'assistant', content: responseText };
          setAiChatMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Keine JSON-Antwort, zeige normale Antwort
        const aiMessage = { role: 'assistant', content: responseText };
        setAiChatMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (error) {
      const errorMessage = { role: 'assistant', content: `❌ Fehler: ${error.message}` };
      setAiChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const generateFullApp = async (appDescription) => {
    setIsGenerating(true);
    setGenerationProgress('🚀 Generiere vollständige App...');
    
    const systemPrompt = `Du bist ein Experte für App-Entwicklung. Generiere eine VOLLSTÄNDIGE, FUNKTIONIERENDE App.

ANFORDERUNG: ${appDescription}

ERSTELLE ALLE DATEIEN die für diese App benötigt werden:
- HTML/CSS/JS für Web-Apps
- Dart/Flutter für Mobile Apps  
- Python für Backend/Scripts
- Alle Dependencies (package.json, requirements.txt, pubspec.yaml)
- README mit Anleitung

ANTWORTE NUR MIT JSON:
{
  "projectName": "app-name",
  "description": "Was die App macht",
  "files": [
    {"name": "index.html", "content": "vollständiger code"},
    {"name": "style.css", "content": "vollständiger code"},
    {"name": "script.js", "content": "vollständiger code"},
    {"name": "README.md", "content": "Anleitung"}
  ]
}`;

    try {
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: systemPrompt,
          temperature: 0.8
        })
      });
      
      const data = await response.json();
      let responseText = data.response || data.message || '';
      
      let jsonMatch = responseText.match(/\{[\s\S]*"files"[\s\S]*\}/i);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        if (result.files && Array.isArray(result.files)) {
          const newFiles = result.files.map((f, i) => {
            const ext = f.name.split('.').pop();
            const languageMap = {
              'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript',
              'py': 'python', 'html': 'html', 'css': 'css', 'md': 'markdown',
              'json': 'json', 'dart': 'dart', 'yaml': 'yaml'
            };
            return {
              id: Date.now() + i,
              name: f.name,
              language: languageMap[ext] || 'plaintext',
              content: f.content
            };
          });
          
          setFiles(newFiles);
          setActiveFile(newFiles[0]);
          setProjectName(result.projectName || 'generated-app');
          
          // Live Preview automatisch öffnen
          setShowPreview(true);
          setTimeout(() => {
            if (previewRef.current) {
              const htmlFile = newFiles.find(f => f.name.endsWith('.html'));
              if (htmlFile) {
                previewRef.current.srcdoc = htmlFile.content;
              }
            }
          }, 200);
          
          addTerminalLine(`🎉 App generiert: ${result.projectName}`);
          addTerminalLine(`📁 ${newFiles.length} Dateien erstellt`);
          addTerminalLine(`▶️ Preview geöffnet!`);
          
          const successMsg = {
            role: 'assistant',
            content: `✅ ${result.description}\n\n📦 Projekt erstellt: ${result.projectName}\n📁 ${newFiles.length} Dateien:\n${newFiles.map(f => `- ${f.name}`).join('\n')}`
          };
          setAiChatMessages(prev => [...prev, successMsg]);
        }
      }
    } catch (error) {
      addTerminalLine(`❌ Generierung fehlgeschlagen: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const createProjectFromTemplate = () => {
    const templates = {
      'web': { files: [
        { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Web App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src="script.js"></script>\n</body>\n</html>' },
        { name: 'style.css', language: 'css', content: 'body { margin: 0; padding: 20px; font-family: Arial; }' },
        { name: 'script.js', language: 'javascript', content: 'console.log("App loaded");' }
      ]},
      'react': { files: [
        { name: 'App.jsx', language: 'javascript', content: 'import React from "react";\n\nfunction App() {\n  return <div><h1>React App</h1></div>;\n}\n\nexport default App;' },
        { name: 'index.js', language: 'javascript', content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));' }
      ]},
      'python': { files: [
        { name: 'main.py', language: 'python', content: 'def main():\n    print("Hello Python")\n\nif __name__ == "__main__":\n    main()' },
        { name: 'requirements.txt', language: 'plaintext', content: '# Add your dependencies here' }
      ]},
      'flutter': { files: [
        { name: 'main.dart', language: 'dart', content: 'import "package:flutter/material.dart";\n\nvoid main() {\n  runApp(MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(title: Text("Flutter App")),\n        body: Center(child: Text("Hello Flutter")),\n      ),\n    );\n  }\n}' },
        { name: 'pubspec.yaml', language: 'yaml', content: 'name: my_app\ndescription: A Flutter app\nenvironment:\n  sdk: ">=2.12.0 <3.0.0"\ndependencies:\n  flutter:\n    sdk: flutter' }
      ]}
    };
    
    const template = templates[projectTemplate];
    if (template) {
      const newFiles = template.files.map((f, i) => ({ ...f, id: Date.now() + i }));
      setFiles(newFiles);
      setActiveFile(newFiles[0]);
      addTerminalLine(`✅ ${projectTemplate.toUpperCase()} Projekt erstellt`);
    }
  };

  return (
    <div className="code-studio">
      {/* Header */}
      <div className="studio-header">
        <div className="header-left">
          <FiCode className="logo-icon" />
          <input 
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
            className="project-name-input"
          />
        </div>
        
        <div className="header-center">
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-selector"
          >
            <optgroup label="💻 Ollama (LOKAL & KOSTENLOS)">
              <option value="qwen2.5-coder:7b">⭐ Qwen2.5-Coder 7B (empfohlen)</option>
              <option value="llama3.2:3b">Llama 3.2 3B</option>
            </optgroup>
            <optgroup label="🎁 GitHub Models (KOSTENLOS)">
              <option value="github-gpt-4o">GPT-4o</option>
              <option value="github-gpt-4o-mini">GPT-4o mini</option>
              <option value="github-Meta-Llama-3.1-405B-Instruct">Llama 3.1 405B</option>
              <option value="github-Mistral-large-2407">Mistral Large</option>
            </optgroup>
            <optgroup label="💰 OpenAI (bezahlt per Token)">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o mini</option>
              <option value="o1">o1 (Reasoning)</option>
              <option value="o1-mini">o1-mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </optgroup>
            {availableModels.length > 0 && (
              <optgroup label={`📚 Alle ${availableModels.length} Modelle`}>
                {availableModels.slice(0, 100).map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name || model.id}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <span className="model-count">🤖 {availableModels.length} Modelle</span>
        </div>
        
        <div className="header-right">
          <button 
            onClick={() => setShowAIChat(!showAIChat)} 
            className={`btn-icon ${showAIChat ? 'active' : ''}`} 
            title="AI Chat Agent"
          >
            <FiMessageSquare />
          </button>
          <button onClick={() => setShowPromptHelper(!showPromptHelper)} className="btn-icon" title="Best Practices">
            <FiCpu />
          </button>
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className={`btn-icon ${showPreview ? 'active' : ''}`}
            title="Preview Toggle"
          >
            {showPreview ? <FiEye /> : <FiEyeOff />}
          </button>
          <button 
            onClick={() => setShowTerminal(!showTerminal)} 
            className={`btn-icon ${showTerminal ? 'active' : ''}`}
            title="Terminal Toggle"
          >
            <FiTerminal />
          </button>
          <button onClick={runCode} className="btn-primary" title="Code ausführen">
            <FiPlay /> Run
          </button>
          <button onClick={createNewFile} className="btn-icon" title="Neue Datei">
            <FiPlusCircle />
          </button>
          <button onClick={importProject} className="btn-icon" title="Projekt importieren">
            <FiUpload />
          </button>
          <button onClick={downloadProject} className="btn-icon" title="Projekt herunterladen">
            <FiDownload />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="btn-icon" title="Einstellungen">
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="studio-content">
        {/* Sidebar - File Explorer */}
        <div className="sidebar">
          <div className="sidebar-header">
            <FiFolder /> Dateien
          </div>
          <div className="file-list">
            {files.length === 0 ? (
              <div className="empty-files">
                <FiFolder size={32} style={{ color: '#4ec9b0', marginBottom: '12px' }} />
                <p>Keine Dateien</p>
                <small>Nutze AI Chat um Dateien zu generieren</small>
              </div>
            ) : (
              files.map(file => (
                <div 
                  key={file.id}
                  className={`file-item ${activeFile?.id === file.id ? 'active' : ''}`}
                  onClick={() => setActiveFile(file)}
                >
                  <FiFile className="file-icon" />
                  <span className="file-name">{file.name}</span>
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="editor-container">
          {activeFile ? (
            <>
              <div className="editor-tabs">
                <div className="tab active">
                  <FiFile /> {activeFile.name}
                </div>
              </div>
              
              <Editor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  cursorStyle: 'line'
                }}
              />
            </>
          ) : (
            <div className="editor-welcome">
              <FiCode size={64} style={{ color: '#4ec9b0', marginBottom: '20px' }} />
              <h2>🚀 Willkommen im Code Studio!</h2>
              <p>Öffne den <strong>AI Chat Agent</strong> oder <strong>Prompt Helper</strong> um loszulegen</p>
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button onClick={() => setShowAIChat(true)} className="welcome-btn primary">
                  <FiMessageSquare /> AI Chat öffnen
                </button>
                <button onClick={() => setShowPromptHelper(true)} className="welcome-btn">
                  💡 Prompt Helper
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview & Terminal */}
        <div className="right-panel">
          {/* Preview */}
          {showPreview && (
            <div className="preview-container">
              <div className="panel-header">
                <FiEye /> Live Preview
                <button 
                  className="btn-close"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </button>
              </div>
              <iframe 
                ref={previewRef}
                className="preview-iframe"
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {/* Terminal */}
          {showTerminal && (
            <div className="terminal-container">
              <div className="panel-header">
                <FiTerminal /> Terminal
                <button 
                  className="btn-close"
                  onClick={() => setShowTerminal(false)}
                >
                  ×
                </button>
              </div>
              <div className="terminal-output">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="terminal-line">{line}</div>
                ))}
              </div>
              <div className="terminal-input-container">
                <span className="terminal-prompt">$</span>
                <input
                  ref={terminalInputRef}
                  type="text"
                  className="terminal-input"
                  placeholder="Befehl eingeben (help für Hilfe)..."
                  onKeyDown={handleTerminalCommand}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Code Agent Panel */}
      {showAIChat && (
        <div 
          ref={aiChatRef}
          className="ai-chat-panel"
          style={{
            position: 'fixed',
            left: `${aiChatPosition.x}px`,
            top: `${aiChatPosition.y}px`,
            zIndex: 3000
          }}
        >
          <div 
            className="ai-chat-header"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          >
            <div className="ai-chat-title">
              <FiMessageSquare /> Code Agent
            </div>
            <div className="agent-selector-header">
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="agent-dropdown"
              >
                <option value="devra">🛠️ DevRA (Development)</option>
                <option value="aura">✨ AurA (Creative)</option>
                <option value="cora">💡 CorA (Problem Solving)</option>
                <option value="lumi">🎨 Lumi (Design)</option>
              </select>
            </div>
            <button 
              onClick={() => {
                setAiChatMessages([]);
                setAiChatInput('');
                addTerminalLine('🔄 Neuer Chat gestartet');
              }} 
              className="btn-new-chat"
              title="Neuer Chat"
            >
              🔄
            </button>
            <button onClick={() => setShowAIChat(false)} className="btn-close-chat">×</button>
          </div>
            
            <div className="ai-chat-messages">
              {aiChatMessages.length === 0 ? (
                <div className="ai-chat-welcome">
                  <FiCode size={48} style={{ color: '#4ec9b0', marginBottom: '16px' }} />
                  <h3>Code Agent bereit!</h3>
                  <p>Ich sehe alle {files.length} Dateien und kann sie bearbeiten, erweitern oder neue erstellen.</p>
                  
                  <div className="quick-actions">
                    <button 
                      onClick={() => setAiChatInput('Erstelle eine vollständige Todo-App mit React und lokalem Storage')}
                      className="quick-action-btn primary"
                    >
                      🚀 Vollständige App generieren
                    </button>
                  </div>
                  
                  <div className="ai-suggestions">
                    <button onClick={() => setAiChatInput(`Analysiere alle ${files.length} Dateien und erstelle einen Bericht`)} className="suggestion-btn">
                      📊 Projekt analysieren
                    </button>
                    <button onClick={() => setAiChatInput('Füge Fehlerbehandlung in alle Dateien ein')} className="suggestion-btn">
                      🔧 Code verbessern
                    </button>
                    <button onClick={() => setAiChatInput('Erstelle vollständige Tests für das Projekt')} className="suggestion-btn">
                      🧪 Tests generieren
                    </button>
                    <button onClick={() => setAiChatInput('Erstelle eine TODO-App mit React')} className="suggestion-btn">
                      ⚛️ React App erstellen
                    </button>
                    <button onClick={() => setAiChatInput('Erstelle eine Flutter App mit Login')} className="suggestion-btn">
                      📱 Flutter App erstellen
                    </button>
                    <button onClick={() => setAiChatInput('Erstelle eine Python API mit FastAPI')} className="suggestion-btn">
                      🐍 Python API erstellen
                    </button>
                  </div>
                </div>
              ) : (
                aiChatMessages.map((msg, i) => (
                  <div key={i} className={`ai-message ${msg.role}`}>
                    <div className="message-icon">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      {msg.content.split('\n').map((line, j) => (
                        <div key={j}>{line}</div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="generating-indicator">
                  <div className="spinner"></div>
                  <span>{generationProgress}</span>
                </div>
              )}
            </div>
            
            <div className="ai-chat-input-container">
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isGenerating && sendAIMessage()}
                placeholder="Beschreibe was ich tun soll (z.B. 'Erstelle eine Login-Seite' oder 'Fixe Fehler in main.js')..."
                className="ai-chat-input"
                disabled={isGenerating}
              />
              <button 
                onClick={sendAIMessage} 
                className="ai-send-btn"
                disabled={isGenerating || !aiChatInput.trim()}
              >
                {isGenerating ? '⏳' : '🚀'} Ausführen
              </button>
            </div>
          </div>
      )}

      {/* Prompt Helper - Full Overlay */}
      {showPromptHelper && (
        <PromptHelper onInsertPrompt={insertPrompt} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <div className="settings-header">
              <h3>Einstellungen</h3>
              <button onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="settings-content">
              <div className="setting-group">
                <label>Projekt Name</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              
              <div className="setting-group">
                <label>Projekt Template</label>
                <select 
                  value={projectTemplate} 
                  onChange={(e) => setProjectTemplate(e.target.value)}
                >
                  <option value="web">🌐 Web (HTML/CSS/JS)</option>
                  <option value="react">⚛️ React</option>
                  <option value="python">🐍 Python</option>
                  <option value="flutter">🦋 Flutter/Dart</option>
                </select>
                <button onClick={createProjectFromTemplate} className="btn-create-template">
                  📁 Projekt erstellen
                </button>
              </div>
              
              <div className="setting-group">
                <label>AI Modell ({availableModels.length} verfügbar)</label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <optgroup label="💻 Ollama (LOKAL)">
                    <option value="qwen2.5-coder:7b">Qwen2.5-Coder 7B ⭐</option>
                    <option value="llama3.2:3b">Llama 3.2 3B</option>
                    <option value="codellama:13b">CodeLlama 13B</option>
                  </optgroup>
                  <optgroup label="🎁 GitHub (GRATIS)">
                    <option value="github-gpt-4o">GPT-4o</option>
                    <option value="github-Meta-Llama-3.1-405B-Instruct">Llama 3.1 405B</option>
                    <option value="github-Mistral-large-2407">Mistral Large</option>
                  </optgroup>
                  <optgroup label="💰 OpenAI">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o mini</option>
                    <option value="o1">o1</option>
                  </optgroup>
                  {availableModels.length > 0 && (
                    <optgroup label="📚 Alle Modelle">
                      {availableModels.slice(0, 100).map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name || model.id}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input 
                    type="checkbox" 
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                  />
                  <span>Live Preview anzeigen</span>
                </label>
              </div>
              
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input 
                    type="checkbox" 
                    checked={showTerminal}
                    onChange={(e) => setShowTerminal(e.target.checked)}
                  />
                  <span>Terminal anzeigen</span>
                </label>
              </div>
              
              <div className="setting-group">
                <label>🔌 Extensions & Packages</label>
                <div className="extensions-list">
                  <div className="extension-item">
                    <span>📦 Python Package Installer</span>
                    <button className="btn-install">Installieren</button>
                  </div>
                  <div className="extension-item">
                    <span>🦋 Flutter SDK</span>
                    <button className="btn-install">Installieren</button>
                  </div>
                  <div className="extension-item">
                    <span>📱 React Native Tools</span>
                    <button className="btn-install">Installieren</button>
                  </div>
                  <div className="extension-item">
                    <span>🍎 iOS Simulator</span>
                    <button className="btn-install">Installieren</button>
                  </div>
                  <div className="extension-item">
                    <span>🤖 Android Emulator</span>
                    <button className="btn-install">Installieren</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudio;
