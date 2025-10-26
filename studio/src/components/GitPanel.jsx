// 🔧 Git Integration Panel - Reusable across all Studios
import React, { useState, useEffect } from 'react';
import { FiGitBranch, FiGitCommit, FiUpload, FiDownload, FiGithub, FiCheck, FiX } from 'react-icons/fi';
import './GitPanel.css';

const GitPanel = ({ projectPath, projectName }) => {
  const [gitStatus, setGitStatus] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (projectPath) {
      checkGitStatus();
    }
  }, [projectPath]);

  const checkGitStatus = async () => {
    try {
      const response = await fetch('http://localhost:8005/api/git/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath })
      });
      const data = await response.json();
      setIsInitialized(data.success);
      setGitStatus(data);
    } catch (error) {
      console.error('Git status check failed:', error);
    }
  };

  const initGit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8005/api/git/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath })
      });
      const data = await response.json();
      
      if (data.success) {
        setIsInitialized(true);
        alert('✅ Git repository initialized!');
        checkGitStatus();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const commitChanges = async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8005/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_path: projectPath,
          message: commitMessage 
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Changes committed!');
        setCommitMessage('');
        checkGitStatus();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pushToGitHub = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8005/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Pushed to GitHub!');
        checkGitStatus();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pullFromGitHub = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8005/api/git/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Pulled latest changes!');
        checkGitStatus();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createGitHubRepo = async () => {
    if (!repoName.trim()) {
      alert('Please enter a repository name!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8005/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_path: projectPath,
          repo_name: repoName,
          description: repoDescription,
          private: isPrivate
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ GitHub repository created!\n\n' + data.message);
        setShowGitHub(false);
        checkGitStatus();
      } else {
        // Show manual instructions if no token
        const message = data.message || data.manual_instructions;
        if (data.manual_instructions) {
          const proceed = confirm(
            '⚠️ GitHub Token not configured\n\n' +
            'Manual steps:\n' +
            data.manual_instructions +
            '\n\nCopy these instructions?'
          );
          if (proceed) {
            navigator.clipboard.writeText(data.manual_instructions);
            alert('Instructions copied to clipboard!');
          }
        } else {
          alert('❌ ' + message);
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!projectPath) {
    return (
      <div className="git-panel">
        <div className="git-empty">
          <FiGitBranch size={32} />
          <p>Generate a project first to use Git features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="git-panel">
      <div className="git-header">
        <FiGitBranch /> Git & GitHub
      </div>

      {!isInitialized ? (
        <div className="git-init">
          <p>Initialize Git repository for this project</p>
          <button onClick={initGit} disabled={loading} className="btn-git">
            <FiGitBranch /> Initialize Git
          </button>
        </div>
      ) : (
        <div className="git-controls">
          {/* Commit Section */}
          <div className="git-section">
            <label>
              <FiGitCommit /> Commit Changes
            </label>
            <input
              type="text"
              placeholder="e.g., Initial commit"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && commitChanges()}
              className="git-input"
            />
            <button 
              onClick={commitChanges} 
              disabled={loading || !commitMessage.trim()}
              className="btn-git btn-commit"
            >
              <FiCheck /> Commit
            </button>
          </div>

          {/* Push/Pull Section */}
          <div className="git-section">
            <label>
              <FiUpload /> Sync with Remote
            </label>
            <div className="git-actions">
              <button onClick={pushToGitHub} disabled={loading} className="btn-git btn-push">
                <FiUpload /> Push
              </button>
              <button onClick={pullFromGitHub} disabled={loading} className="btn-git btn-pull">
                <FiDownload /> Pull
              </button>
            </div>
          </div>

          {/* GitHub Repo Creation */}
          <div className="git-section">
            <button 
              onClick={() => setShowGitHub(!showGitHub)} 
              className="btn-git btn-github"
            >
              <FiGithub /> Create GitHub Repository
            </button>

            {showGitHub && (
              <div className="github-modal">
                <div className="github-form">
                  <h4>Create New GitHub Repository</h4>
                  <input
                    type="text"
                    placeholder="Repository name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="git-input"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={repoDescription}
                    onChange={(e) => setRepoDescription(e.target.value)}
                    className="git-input"
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                    Private repository
                  </label>
                  <div className="modal-actions">
                    <button onClick={createGitHubRepo} disabled={loading} className="btn-git btn-create">
                      <FiGithub /> Create
                    </button>
                    <button onClick={() => setShowGitHub(false)} className="btn-git btn-cancel">
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {gitStatus && (
            <div className="git-status">
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className="status-value">
                  {gitStatus.success ? '✅ Ready' : '⚠️ ' + gitStatus.message}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitPanel;
