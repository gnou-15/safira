import express from 'express';
import { AiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Define AI proxy endpoints with authentication and rate limiting
router.post('/generate', authMiddleware, rateLimiter, AiController.generateReport);
router.post('/suggest-details', authMiddleware, rateLimiter, AiController.suggestDetails);
router.post('/chat', authMiddleware, rateLimiter, AiController.chatAgent);

// Document management (protected by authentication)
router.get('/documents', authMiddleware, AiController.listDocuments);
router.delete('/documents', authMiddleware, AiController.deleteDocument);
router.post('/upload', authMiddleware, AiController.uploadDocument);

export default router;
