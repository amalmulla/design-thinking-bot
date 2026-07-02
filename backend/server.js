const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRouter = require('./routes/auth');
const challengesRouter = require('./routes/challenges');
const projectsRouter = require('./routes/projects');
const usersRouter = require('./routes/users');
const aiRouter = require('./routes/ai');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased for local development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' }
});

// Restrict CORS to the deployed frontend when CLIENT_ORIGIN is set; allow all otherwise
// (e.g. local development, or before the frontend URL is known on first deploy).
const clientOrigin = process.env.CLIENT_ORIGIN;

// Global middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(cors(clientOrigin ? { origin: clientOrigin } : {}));
app.use(express.json());
app.use('/api', apiLimiter);

// Initialize Socket.io
const io = new Server(server, {
  cors: clientOrigin ? { origin: clientOrigin } : {}
});

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup Socket.io connections
io.on('connection', (socket) => {
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
  });
});

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("DB STATUS: Connected to MongoDB Atlas successfully!");
  })
  .catch((err) => {
    console.error("DB CONNECTION ERROR:", err.message);
  });

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
