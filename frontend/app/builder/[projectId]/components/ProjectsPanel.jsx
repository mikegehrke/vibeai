'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Folder, FolderOpen, FileCode, Calendar, 
  Trash2, ExternalLink, Loader2, RefreshCw,
  SiFlutter, SiReact, SiNextdotjs, SiVuedotjs,
  SiPython, SiNodedotjs, SiSwift, SiKotlin
} from 'lucide-react';
import { 
  SiFlutter as FlutterIcon, 
  SiReact as ReactIcon, 
  SiNextdotjs as NextIcon,
  SiVuedotjs as VueIcon,
  SiPython as PythonIcon,
  SiNodedotjs as NodeIcon,
  SiSwift as SwiftIcon,
  SiKotlin as KotlinIcon
} from 'react-icons/si';

const frameworkIcons = {
  flutter: FlutterIcon,
  react: ReactIcon,
  nextjs: NextIcon,
  vue: VueIcon,
  python: PythonIcon,
  node: NodeIcon,
  'ios-swift': SwiftIcon,
  'android-kotlin': KotlinIcon,
};

export default function ProjectsPanel({ onProjectSelect }) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ⚡ WICHTIG: Timeout und bessere Fehlerbehandlung
      // ⚡ ERHÖHT: 30 Sekunden Timeout (Backend braucht manchmal länger beim Start)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 Sekunden Timeout
      
      try {
        const response = await fetch('http://localhost:8005/api/projects/list', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        setProjects(data.projects || data || []);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Verbindungs-Timeout: Backend antwortet nicht. Prüfe ob Backend auf Port 8005 läuft.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('❌ Error loading projects:', err);
      let errorMessage = err.message || 'Failed to load projects';
      
      // ⚡ BESSERE FEHLERMELDUNGEN
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Backend nicht erreichbar. Prüfe ob Backend auf Port 8005 läuft.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        errorMessage = 'Verbindungs-Timeout: Backend antwortet nicht.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenProject = (projectId) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    } else {
      router.push(`/builder/${projectId}`);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    
    if (!confirm(`Möchtest du das Projekt "${projectId}" wirklich löschen?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8005/api/projects/${projectId}/delete`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadProjects();
      } else {
        alert('Fehler beim Löschen des Projekts');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Fehler beim Löschen des Projekts');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unbekannt';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrameworkIcon = (platform) => {
    const Icon = frameworkIcons[platform?.toLowerCase()] || FileCode;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#858585'
      }}>
        <Loader2 size={24} className="animate-spin" />
        <div style={{ fontSize: '12px' }}>Lade Projekte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: '#ff6b6b'
      }}>
        <div style={{ fontSize: '12px' }}>❌ {error}</div>
        <button
          onClick={loadProjects}
          style={{
            padding: '6px 12px',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <RefreshCw size={14} style={{ marginRight: '6px', display: 'inline' }} />
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#858585',
        textAlign: 'center'
      }}>
        <Folder size={48} style={{ opacity: 0.5 }} />
        <div style={{ fontSize: '14px', fontWeight: 500 }}>Keine Projekte gefunden</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Erstelle ein neues Projekt im App Builder
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#cccccc',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FolderOpen size={16} />
          Projekte ({projects.length})
        </div>
        <button
          onClick={loadProjects}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#858585',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px'
          }}
          title="Aktualisieren"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Projects List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleOpenProject(project.id)}
            style={{
              padding: '12px',
              marginBottom: '8px',
              background: '#252526',
              border: '1px solid #3c3c3c',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2d2d30';
              e.currentTarget.style.borderColor = '#007acc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#252526';
              e.currentTarget.style.borderColor = '#3c3c3c';
            }}
          >
            {/* Project Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#4ec9b0' }}>
                {getFrameworkIcon(project.platform)}
              </div>
              <div style={{
                flex: 1,
                fontSize: '13px',
                fontWeight: 500,
                color: '#cccccc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {project.name || project.id}
              </div>
              <button
                onClick={(e) => handleDeleteProject(project.id, e)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#858585',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ff6b6b';
                  e.currentTarget.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#858585';
                  e.currentTarget.style.opacity = 0.7;
                }}
                title="Projekt löschen"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Project Info */}
            <div style={{
              fontSize: '11px',
              color: '#858585',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {project.platform && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{project.platform}</span>
                </div>
              )}
              {project.file_count !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCode size={12} />
                  <span>{project.file_count} Dateien</span>
                </div>
              )}
              {project.last_modified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} />
                  <span>{formatDate(project.last_modified)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

