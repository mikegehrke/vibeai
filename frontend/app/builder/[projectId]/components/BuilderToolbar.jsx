'use client';

import { useState } from 'react';
import { FaDownload, FaFileImport, FaGithub, FaRobot, FaSave, FaUpload } from 'react-icons/fa';

export default function BuilderToolbar({ projectId, onSave, onGitHub, onExport, onImport, onAIChat }) {
  const [showGitMenu, setShowGitMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  return (
    <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 border-b border-gray-700">
      {/* Save */}
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
      >
        <FaSave />
        <span>Save</span>
      </button>

      {/* GitHub Menu */}
      <div className="relative">
        <button
          onClick={() => setShowGitMenu(!showGitMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          <FaGithub />
          <span>GitHub</span>
        </button>
        {showGitMenu && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 min-w-[200px]">
            <button
              onClick={() => {
                onGitHub('clone');
                setShowGitMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2"
            >
              <FaDownload className="text-blue-400" />
              Clone Repository
            </button>
            <button
              onClick={() => {
                onGitHub('push');
                setShowGitMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2"
            >
              <FaUpload className="text-green-400" />
              Push to GitHub
            </button>
            <button
              onClick={() => {
                onGitHub('pull');
                setShowGitMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2 border-t border-gray-700"
            >
              <FaDownload className="text-purple-400" />
              Pull Updates
            </button>
          </div>
        )}
      </div>

      {/* Import/Export Menu */}
      <div className="relative">
        <button
          onClick={() => setShowImportMenu(!showImportMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          <FaFileImport />
          <span>Import/Export</span>
        </button>
        {showImportMenu && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 min-w-[200px]">
            <button
              onClick={() => {
                onImport('zip');
                setShowImportMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2"
            >
              <FaUpload className="text-blue-400" />
              Upload ZIP
            </button>
            <button
              onClick={() => {
                onExport('zip');
                setShowImportMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2"
            >
              <FaDownload className="text-green-400" />
              Download ZIP
            </button>
            <button
              onClick={() => {
                onImport('folder');
                setShowImportMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-gray-700 text-left flex items-center gap-2 border-t border-gray-700"
            >
              <FaFileImport className="text-purple-400" />
              Import Folder
            </button>
          </div>
        )}
      </div>

      {/* AI Chat */}
      <button
        onClick={onAIChat}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition"
      >
        <FaRobot />
        <span>AI Chat</span>
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Project Info */}
      <div className="text-sm text-gray-400">
        Project: <span className="text-white font-medium">{projectId}</span>
      </div>
    </div>
  );
}
