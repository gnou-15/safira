import express from 'express';
import { InvestigationController } from '../controllers/investigationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all endpoints with Bearer auth middleware
router.use(authMiddleware);

// Define safety investigation CRUD endpoints
router.get('/', InvestigationController.getInvestigations);
router.get('/:id', InvestigationController.getInvestigationById);
router.post('/', InvestigationController.createInvestigation);
router.put('/:id', InvestigationController.updateInvestigation);
router.delete('/:id', InvestigationController.deleteInvestigation);

export default router;
