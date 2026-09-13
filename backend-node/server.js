import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes.js';
import investigationRoutes from './routes/investigationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { getHealth } from './controllers/healthController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Health checks
app.get('/health', getHealth);
app.get('/api/health', getHealth);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js API Gateway listening on port ${PORT}`);
});


