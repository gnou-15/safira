import express from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all endpoints with Bearer auth middleware
router.use(authMiddleware);

// Define report endpoints
router.get('/', ReportController.getReports);
router.get('/:id', ReportController.getReportById);
router.post('/', ReportController.createReport);
router.put('/:id', ReportController.updateReport);
router.delete('/:id', ReportController.deleteReport);
router.put('/:id/rows', ReportController.upsertRows);

export default router;
