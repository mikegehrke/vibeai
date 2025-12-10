'use client';

import { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, Circle, CheckCircle2 } from 'lucide-react';

export default function FileTree({ files, activeFile, onFileClick, getFileIcon }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['/']));

  // Organize files into tree structure
  const fileTree = {};
  
  files.forEach(file => {
    const parts = file.path.split('/').filter(p => p);
    let current = fileTree;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // File
        current[part] = { type: 'file', ...file };
      } else {
        // Folder
        if (!current[part]) {
          current[part] = { type: 'folder', children: {} };
        }
        current = current[part].children;
      }
    });
  });

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (tree, path = '/', level = 0) => {
    const items = [];
    
    Object.entries(tree).sort(([a], [b]) => {
      const aIsFolder = tree[a].type === 'folder';
      const bIsFolder = tree[b].type === 'folder';
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return a.localeCompare(b);
    }).forEach(([name, item]) => {
      const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const isExpanded = expandedFolders.has(fullPath);
      
      if (item.type === 'folder') {
        items.push(
          <div key={fullPath}>
            <div
              onClick={() => toggleFolder(fullPath)}
              style={{
                padding: '4px 8px 4px ' + (level * 16 + 8) + 'px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#cccccc',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                userSelect: 'none'
              }}
            >
              {isExpanded ? (
                <ChevronDown size={14} color="#858585" />
              ) : (
                <ChevronRight size={14} color="#858585" />
              )}
              <Folder size={14} color="#858585" />
              <span>{name}</span>
            </div>
            {isExpanded && renderTree(item.children, fullPath, level + 1)}
          </div>
        );
      } else {
        const isActive = activeFile?.path === item.path;
        // Git status (M = modified, U = untracked)
        const gitStatus = item.gitStatus || (item.modified ? 'M' : item.untracked ? 'U' : null);
        
        items.push(
          <div
            key={item.path}
            onClick={() => onFileClick(item)}
            style={{
              padding: '4px 8px 4px ' + (level * 16 + 8) + 'px',
              cursor: 'pointer',
              fontSize: '12px',
              color: isActive ? '#ffffff' : '#cccccc',
              background: isActive ? '#37373d' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <File size={14} color="#858585" />
            <span style={{ flex: 1 }}>{name}</span>
            {gitStatus && (
              gitStatus === 'M' ? (
                <Circle size={10} fill="#ffa500" color="#ffa500" />
              ) : (
                <CheckCircle2 size={10} fill="#4ec9b0" color="#4ec9b0" />
              )
            )}
          </div>
        );
      }
    });
    
    return items;
  };

  return <div>{renderTree(fileTree)}</div>;
}

