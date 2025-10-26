// 🎮 Interactive App Preview Component
import React, { useState, useEffect } from 'react';
import './InteractivePreview.css';

const InteractivePreview = ({ files, appName, platform }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="interactive-preview">
      <div className="preview-app-bar">
        <h1>{appName || 'MyTimer'}</h1>
      </div>
      
      <div className="preview-content">
        <div className="timer-display">
          <div className={`timer-circle ${isRunning ? 'running' : ''}`}>
            <div className="timer-text">{formatTime(seconds)}</div>
          </div>
          
          <div className={`status-badge ${isRunning ? 'status-running' : 'status-stopped'}`}>
            {isRunning ? '▶️ Running' : '⏸️ Ready'}
          </div>
          
          <div className="button-row">
            <button className="flutter-button btn-start" onClick={startTimer} disabled={isRunning}>
              ▶️ Start
            </button>
            <button className="flutter-button btn-stop" onClick={stopTimer} disabled={!isRunning}>
              ⏸️ Pause
            </button>
            <button className="flutter-button btn-reset" onClick={resetTimer}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePreview;
