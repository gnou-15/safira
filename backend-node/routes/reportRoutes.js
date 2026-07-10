import express from 'express';
import { ReportController } from '../controllers/reportController.js';

const router = express.Router();

// Define report endpoints
router.get('/', ReportController.getReports);
router.get('/:id', ReportController.getReportById);
router.post('/', ReportController.createReport);
router.put('/:id', ReportController.updateReport);
router.delete('/:id', ReportController.deleteReport);
router.put('/:id/rows', ReportController.upsertRows);

export default router;
