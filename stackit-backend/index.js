// backend/index.js

import express from 'express';
import cors from 'cors';

// Import dotenv for ES module compatibility
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// Get __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file using ES module syntax
// It's good practice to explicitly define the path in ES Modules
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- Add these console logs for debugging purposes ---
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI);
console.log('PORT from .env:', process.env.PORT);
// --- End debug logs ---

// Connect to MongoDB
connectDB(); // Assuming connectDB uses process.env.MONGODB_URI internally

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity, can be restricted later
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to attach io instance to req
app.use((req, res, next) => {
  req.io = io;
  req.getUser = getUser; // Assuming getUser is defined somewhere accessible, if not, move its definition up
  next();
});

// Socket.IO connection handling
let users = [];

const addUser = (userId, socketId) => {
  !users.some(user => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find(user => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('A user connected.');

  // take userId and socketId from user
  socket.on('addUser', userId => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  // disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend server is healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Make 'uploads' directory static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route (optional)
app.get('/', (req, res) => {
  res.send('StackIt Backend API');
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default server;