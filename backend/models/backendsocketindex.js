const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join a project room
    socket.on('joinProject', async (projectId) => {
      socket.join(projectId);
      
      // Get project data
      const project = await Project.findById(projectId);
      if (project) {
        socket.emit('loadProject', project);
      }
      
      // Notify others
      socket.to(projectId).emit('userJoined', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    // Handle code changes
    socket.on('codeChange', async (data) => {
      const { projectId, type, content } = data;
      
      // Update in database
      await Project.findByIdAndUpdate(projectId, { [type]: content });
      
      // Broadcast to others in the room
      socket.to(projectId).emit('codeUpdate', {
        type,
        content,
        userId: socket.user.id
      });
    });

    // Handle cursor movement
    socket.on('cursorMove', (data) => {
      socket.to(data.projectId).emit('cursorUpdate', {
        userId: socket.user.id,
        position: data.position
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      // Notify all projects this user was in
      // In a real app, you'd track which projects the user was in
    });
  });

  return io;
};
