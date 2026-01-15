import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';

import { config } from './config';
import { auth } from './lib/auth';
import { errorHandler, notFoundHandler } from './middleware';
import { tracingMiddleware } from './middleware/tracing';

// Import routes
import { kelompokRoutes } from './modules/kelompok';
import { kpmRoutes, kpmKelompokRoutes } from './modules/kpm';
import { absensiRoutes, absensiKelompokRoutes } from './modules/absensi';
import { usahaRoutes, usahaKelompokRoutes, usahaKpmRoutes } from './modules/usaha';
import { prestasiRoutes, prestasiKelompokRoutes, prestasiKpmRoutes } from './modules/prestasi';
import { permasalahanRoutes, permasalahanKelompokRoutes, permasalahanKpmRoutes } from './modules/permasalahan';
import { graduasiRoutes, graduasiKelompokRoutes, graduasiKpmRoutes } from './modules/graduasi';
import { reportsRoutes } from './modules/reports';
import { usersRoutes } from './modules/users';
import { adminRoutes } from './modules/admin';
import { jadwalRoutes } from './modules/jadwal/jadwal.routes';
import { setupRoutes } from './modules/auth';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.cors.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Components: Tracing (must be early to wrap subsequent middlewares in context)
app.use(tracingMiddleware);

import { logger } from './lib/logger';

// Request logging
const morganFormat = config.server.isDev ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
            // Trim the newline from morgan
            logger.info(message.trim());
        },
    },
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
    });
});

// Better Auth handler - handles all /api/auth/* routes
// The '*' wildcard matches any path after /api/auth/
// Custom auth routes (password setup) - must be before wildcard
app.use('/api/auth', setupRoutes);
app.all('/api/auth/*', toNodeHandler(auth));

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/kelompok', kelompokRoutes);
app.use('/api/kpm', kpmRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/usaha', usahaRoutes);
app.use('/api/prestasi', prestasiRoutes);
app.use('/api/permasalahan', permasalahanRoutes);
app.use('/api/graduasi', graduasiRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jadwal', jadwalRoutes);

// Nested routes under /api/kelompok/:kelompokId
app.use('/api/kelompok/:kelompokId/kpm', kpmKelompokRoutes);
app.use('/api/kelompok/:kelompokId/absensi', absensiKelompokRoutes);
app.use('/api/kelompok/:kelompokId/usaha', usahaKelompokRoutes);
app.use('/api/kelompok/:kelompokId/prestasi', prestasiKelompokRoutes);
app.use('/api/kelompok/:kelompokId/permasalahan', permasalahanKelompokRoutes);
app.use('/api/kelompok/:kelompokId/graduasi', graduasiKelompokRoutes);

// Nested routes under /api/kpm/:kpmId
app.use('/api/kpm/:kpmId/usaha', usahaKpmRoutes);
app.use('/api/kpm/:kpmId/prestasi', prestasiKpmRoutes);
app.use('/api/kpm/:kpmId/permasalahan', permasalahanKpmRoutes);
app.use('/api/kpm/:kpmId/graduasi', graduasiKpmRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
