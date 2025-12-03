import React from 'react';

const CodeStudioSimple = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '48px',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        🚀 CODE STUDIO TEST
      </h1>
      <p style={{
        color: 'white',
        fontSize: '24px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        If you can read this in purple gradient, CodeStudio is rendering!
      </p>
      <div style={{
        background: 'white',
        padding: '30px 60px',
        borderRadius: '15px',
        color: '#667eea',
        fontSize: '24px',
        fontWeight: 'bold',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        ✅ Component Loaded Successfully
      </div>
      <button 
        onClick={() => alert('Button works!')}
        style={{
          marginTop: '30px',
          background: '#FF6B6B',
          color: 'white',
          border: 'none',
          padding: '15px 40px',
          fontSize: '20px',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
        }}
      >
        Click Me to Test
      </button>
    </div>
  );
};

export default CodeStudioSimple;
