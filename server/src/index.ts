import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import domainRoutes from './routes/domain.routes';
import mailboxRoutes from './routes/mailbox.routes';
import { errorMiddleware } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for MVP development
  credentials: true
}));
app.use(express.json());

// Basic sanity route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: require('./config/db').useMongo ? 'MongoDB' : 'JSON Fallback Local Storage'
  });
});

// Bind routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/mailboxes', mailboxRoutes);

// Error middleware
app.use(errorMiddleware);

// Initialize DB and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();
