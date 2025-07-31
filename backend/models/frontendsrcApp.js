import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import UserCursors from './components/UserCursors';
import socket from './services/socket';

const App = () => {
  const [projectId, setProjectId] = useState('demo-project');
  const [activeTab, setActiveTab] = useState('html');
  const [project, setProject] = useState({
    html: '<div>Hello World!</div>',
    css: 'div { color: blue; }',
    javascript: 'console.log("Hello");',
  });

  useEffect(() => {
    // Join the project room
    socket.emit('joinProject', projectId);
    
    // Load project data
    socket.on('loadProject', (projectData) => {
      setProject(projectData);
    });
    
    return () => {
      socket.off('loadProject');
    };
  }, [projectId]);

  return (
    <div className="app-container">
      <div className="editor-panel">
        <div className="header">
          <h1>Collaborative Code Editor</h1>
        </div>
        <div className="tabs">
          {['html', 'css', 'javascript'].map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </div> 
          ))}
        </div>
        <div className="editor-container">
          <Editor
            projectId={projectId}
            language={activeTab}
            initialContent={project[activeTab]}
            type={activeTab}
          />
          <UserCursors projectId={projectId} />
        </div>
      </div>
      <div className="preview-panel">
        <div className="header">
          <h2>Live Preview</h2>
        </div>
        <Preview projectId={projectId} />
      </div>
    </div>
  );
};

export default App;
