import React, { useState, useEffect } from 'react';
import socket from '../services/socket';

const Preview = ({ projectId }) => {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [javascript, setJavascript] = useState('');

  useEffect(() => {
    // Listen for code updates
    const handleCodeUpdate = (data) => {
      if (data.userId !== socket.id) {
        switch (data.type) {
          case 'html':
            setHtml(data.content);
            break;
          case 'css':
            setCss(data.content);
            break;
          case 'javascript':
            setJavascript(data.content);
            break;
          default:
            break;
        }
      }
    };

    socket.on('codeUpdate', handleCodeUpdate);
    
    return () => {
      socket.off('codeUpdate', handleCodeUpdate);
    };
  }, []);

  // Create the document for the iframe
  const getPreviewContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
      </html>
    `;
  };

  return (
    <iframe
      title="preview"
      srcDoc={getPreviewContent()}
      className="preview-container"
      sandbox="allow-scripts"
    />
  );
};

export default Preview;
