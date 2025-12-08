'use client';

import { useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa';

export default function CodeCopyButton({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition opacity-0 group-hover:opacity-100"
      title="Code kopieren"
    >
      {copied ? (
        <FaCheck className="text-green-400" />
      ) : (
        <FaCopy className="text-gray-300" />
      )}
    </button>
  );
}
