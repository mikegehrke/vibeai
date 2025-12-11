'use client';

import { useState } from 'react';
import { Search, File, Code, Replace } from 'lucide-react';

export default function SearchPanel({ files, onFileSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchInFiles, setSearchInFiles] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [results, setResults] = useState([]);

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const found = [];
    const regex = useRegex 
      ? new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
      : new RegExp(
          searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          caseSensitive ? 'g' : 'gi'
        );

    files.forEach(file => {
      if (!file.content) return;
      
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        const matches = [...line.matchAll(regex)];
        if (matches.length > 0) {
          matches.forEach(match => {
            found.push({
              file: file.path,
              fileName: file.name,
              line: index + 1,
              column: match.index + 1,
              text: line.trim(),
              match: match[0]
            });
          });
        }
      });
    });

    setResults(found);
  };

  const handleReplace = () => {
    if (!replaceQuery || results.length === 0) return;
    
    // Replace in files
    const updatedFiles = files.map(file => {
      const fileResults = results.filter(r => r.file === file.path);
      if (fileResults.length === 0) return file;

      let content = file.content;
      const regex = useRegex 
        ? new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
        : new RegExp(
            searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            caseSensitive ? 'g' : 'gi'
          );

      content = content.replace(regex, replaceQuery);
      
      return { ...file, content };
    });

    // Update files and clear results
    setResults([]);
    alert(`✅ Replaced ${results.length} occurrences`);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc'
    }}>
      {/* Search Input */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <Search size={14} style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#858585'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') performSearch();
              }}
              placeholder="Search"
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                background: '#1e1e1e',
                border: '1px solid #3c3c3c',
                borderRadius: '4px',
                color: '#cccccc',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={performSearch}
            style={{
              padding: '6px 12px',
              background: '#007acc',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>

        {/* Replace Input */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <Replace size={14} style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#858585'
            }} />
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace"
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                background: '#1e1e1e',
                border: '1px solid #3c3c3c',
                borderRadius: '4px',
                color: '#cccccc',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={handleReplace}
            disabled={!replaceQuery || results.length === 0}
            style={{
              padding: '6px 12px',
              background: replaceQuery && results.length > 0 ? '#007acc' : '#3c3c3c',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: replaceQuery && results.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Replace All
          </button>
        </div>

        {/* Options */}
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '11px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Aa</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={(e) => setWholeWord(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Ab</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>.*</span>
          </label>
        </div>
      </div>

      {/* Results */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px'
      }}>
        {results.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#858585',
            fontSize: '12px'
          }}>
            {searchQuery ? 'No results found' : 'Enter a search term'}
          </div>
        ) : (
          <div>
            <div style={{
              padding: '8px',
              fontSize: '11px',
              color: '#858585',
              borderBottom: '1px solid #3c3c3c',
              marginBottom: '8px'
            }}>
              {results.length} results in {new Set(results.map(r => r.file)).size} files
            </div>
            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => onFileSelect && onFileSelect(result.file, result.line)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #2d2d30',
                  fontSize: '11px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2d2d30';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <File size={12} color="#858585" />
                  <span style={{ color: '#4ec9b0' }}>{result.fileName}</span>
                  <span style={{ color: '#858585' }}>:{result.line}:{result.column}</span>
                </div>
                <div style={{
                  color: '#cccccc',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  paddingLeft: '20px'
                }}>
                  {result.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






