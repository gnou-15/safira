import express from 'express';
import { AiController } from '../controllers/aiController.js';

const router = express.Router();

// Define AI proxy endpoints
router.post('/generate', AiController.generateReport);
router.post('/suggest-details', AiController.suggestDetails);
router.post('/chat', AiController.chatAgent);
router.get('/documents', AiController.listDocuments);
router.delete('/documents', AiController.deleteDocument);
router.post('/upload', AiController.uploadDocument);


export default router;
