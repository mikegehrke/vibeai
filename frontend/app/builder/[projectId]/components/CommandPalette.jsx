'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, File, Code, Settings, GitBranch, Terminal, Package, Zap } from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onCommand 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: 'new-file', label: 'New File', icon: File, shortcut: 'Ctrl+N', category: 'File' },
    { id: 'open-file', label: 'Open File', icon: File, shortcut: 'Ctrl+O', category: 'File' },
    { id: 'save', label: 'Save', icon: File, shortcut: 'Ctrl+S', category: 'File' },
    { id: 'format', label: 'Format Document', icon: Code, shortcut: 'Shift+Alt+F', category: 'Editor' },
    { id: 'terminal', label: 'Toggle Terminal', icon: Terminal, shortcut: 'Ctrl+`', category: 'View' },
    { id: 'git-status', label: 'Git: Status', icon: GitBranch, shortcut: '', category: 'Git' },
    { id: 'git-commit', label: 'Git: Commit', icon: GitBranch, shortcut: '', category: 'Git' },
    { id: 'package-install', label: 'Install Package', icon: Package, shortcut: '', category: 'Package' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+,', category: 'Preferences' },
    { id: 'ai-chat', label: 'AI Chat', icon: Zap, shortcut: 'Ctrl+L', category: 'AI' },
  ];

  const filteredCommands = query
    ? commands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onCommand(filteredCommands[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, onCommand]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxWidth: '90vw',
      background: '#252526',
      border: '1px solid #3c3c3c',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 10000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Search size={16} color="#858585" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or search..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#cccccc',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <div style={{
          fontSize: '11px',
          color: '#858585',
          padding: '2px 6px',
          background: '#1e1e1e',
          borderRadius: '3px'
        }}>
          ESC
        </div>
      </div>

      {/* Commands List */}
      <div style={{
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {filteredCommands.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#858585',
            fontSize: '13px'
          }}>
            No commands found
          </div>
        ) : (
          filteredCommands.map((cmd, index) => {
            const Icon = cmd.icon;
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={cmd.id}
                onClick={() => onCommand(cmd.id)}
                style={{
                  padding: '10px 16px',
                  background: isSelected ? '#37373d' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '3px solid #007acc' : '3px solid transparent'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon size={16} color={isSelected ? '#007acc' : '#858585'} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    color: isSelected ? '#ffffff' : '#cccccc',
                    fontWeight: isSelected ? '500' : '400'
                  }}>
                    {cmd.label}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#858585',
                    marginTop: '2px'
                  }}>
                    {cmd.category}
                  </div>
                </div>
                {cmd.shortcut && (
                  <div style={{
                    fontSize: '11px',
                    color: '#858585',
                    padding: '2px 6px',
                    background: '#1e1e1e',
                    borderRadius: '3px'
                  }}>
                    {cmd.shortcut}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}













