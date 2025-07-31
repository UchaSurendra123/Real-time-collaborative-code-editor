import React, { useState, useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import socket from '../services/socket';

const Editor = ({ projectId, language, initialContent, type }) => {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    // Initialize Monaco Editor
    const editorInstance = monaco.editor.create(editorRef.current, {
      value: content,
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });

    setEditor(editorInstance);

    // Listen for content changes
    editorInstance.onDidChangeModelContent(() => {
      const newContent = editorInstance.getValue();
      setContent(newContent);
      
      // Emit change to server
      socket.emit('codeChange', {
        projectId,
        type,
        content: newContent
      });
    });

    // Clean up
    return () => {
      editorInstance.dispose();
    };
  }, [language, projectId, type]);

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && content !== initialContent) {
      editor.setValue(initialContent);
      setContent(initialContent);
    }
  }, [initialContent, editor, content]);

  // Listen for updates from other users
  useEffect(() => {
    const handleCodeUpdate = (data) => {
      if (data.type === type && data.userId !== socket.id) {
        setContent(data.content);
      }
    };

    socket.on('codeUpdate', handleCodeUpdate);
    
    return () => {
      socket.off('codeUpdate', handleCodeUpdate);
    };
  }, [type]);

  return <div ref={editorRef} className="editor-container" />;
};

export default Editor;
