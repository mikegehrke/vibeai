import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck } from 'react-icons/fi';
import './MessageRenderer.css';

const MessageRenderer = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <ReactMarkdown
      className="markdown-content"
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          const codeIndex = node.position?.start.line;

          return !inline && match ? (
            <div className="code-block">
              <div className="code-header">
                <span className="code-language">{match[1]}</span>
                <button
                  className="code-copy-btn"
                  onClick={() => copyCode(codeString, codeIndex)}
                >
                  {copiedCode === codeIndex ? (
                    <>
                      <FiCheck /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy /> Copy
                    </>
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 8px 8px',
                  fontSize: '0.9rem'
                }}
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Styling für andere Markdown-Elemente
        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
        p: ({ children }) => <p className="md-p">{children}</p>,
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
        table: ({ children }) => <table className="md-table">{children}</table>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MessageRenderer;
