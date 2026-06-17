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

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased for local development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' }
});

// Global middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter);

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
