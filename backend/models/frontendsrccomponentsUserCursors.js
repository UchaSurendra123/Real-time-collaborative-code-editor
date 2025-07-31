import React, { useState, useEffect } from 'react';
import socket from '../services/socket';

const UserCursors = ({ projectId }) => {
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    // Listen for cursor updates
    const handleCursorUpdate = (data) => {
      if (data.userId !== socket.id) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: data.position
        }));
      }
    };

    socket.on('cursorUpdate', handleCursorUpdate);
    
    return () => {
      socket.off('cursorUpdate', handleCursorUpdate);
    };
  }, [projectId]);

  return (
    <>
      {Object.entries(cursors).map(([userId, position]) => (
        <div
          key={userId}
          className="user-cursor"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <div className="user-label">User {userId.slice(-4)}</div>
        </div>
      ))}
    </>
  );
};

export default UserCursors;
