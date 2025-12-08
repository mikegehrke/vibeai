'use client';

import { useRef, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

export default function FileDropZone({ onFilesUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const fileData = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content: content,
          size: file.size
        };
      })
    );

    onFilesUpload(fileData);
  };

  return (
    <>
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
          }
        `}
      >
        <FaUpload className="mx-auto text-4xl mb-4 text-gray-400" />
        <p className="text-lg mb-2">
          {isDragging
            ? 'Dateien hier ablegen...'
            : 'Dateien hier ablegen oder klicken'
          }
        </p>
        <p className="text-sm text-gray-500">
          Unterstützt: .dart, .yaml, .json, .md, .txt
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory=""
        className="hidden"
        onChange={handleFileSelect}
        accept=".dart,.yaml,.yml,.json,.md,.txt,.js,.ts,.tsx,.jsx"
      />
    </>
  );
}
