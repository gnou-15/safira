import express from 'express';
import { AiController } from '../controllers/aiController.js';

const router = express.Router();

// Define AI proxy endpoints
router.post('/generate', AiController.generateReport);
router.post('/chat', AiController.chatAgent);

export default router;
