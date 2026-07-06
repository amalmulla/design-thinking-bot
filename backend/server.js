const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');

dotenv.config();

const authRouter = require('./routes/auth');
const challengesRouter = require('./routes/challenges');
const projectsRouter = require('./routes/projects');
const usersRouter = require('./routes/users');
const aiRouter = require('./routes/ai');
const path = require('path');

const app = express();
// Wrap Express in a bare HTTP server so Socket.io can share the same port.
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

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

// --- Realtime (Socket.io) ---
// Deliberately isolated: if any of this throws, we log and continue so the REST API
// and login still boot. Realtime is an enhancement, never load-bearing.
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    // Mirror the REST CORS policy: lock to CLIENT_ORIGIN when set, otherwise allow all.
    cors: clientOrigin ? { origin: clientOrigin } : { origin: '*' },
  });
  io.on('connection', (socket) => {
    // Each open project drawer joins a room keyed by projectId so broadcasts stay scoped.
    socket.on('joinProject', (projectId) => {
      if (projectId) socket.join(String(projectId));
    });
  });
  console.log('Socket.io initialized (realtime team chat enabled).');
} catch (err) {
  console.error('Socket.io failed to initialize — realtime disabled, REST/login still up:', err.message);
  io = null;
}
// Expose io to routes via req.app.get('io'); it may be null (realtime off).
app.set('io', io);

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
