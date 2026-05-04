const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Routes imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { protectUser } = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded images
app.use('/images', express.static(path.join(__dirname, 'uploads', 'images')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', protectUser, adminRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
