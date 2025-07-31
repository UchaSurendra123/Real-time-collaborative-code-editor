require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const projectRoutes = require('./routes/projects');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Setup Socket.IO
const io = setupSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
