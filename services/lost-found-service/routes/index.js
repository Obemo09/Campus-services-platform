import { Router } from 'express';
import {
  claimReport, createReport, deleteReport,
  getMyReports, getReport, getReports, resolveReport,
} from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => res.json({ service: 'lost-found-service', status: 'ok' }));
router.get('/', getReports);
router.get('/my', getMyReports);
router.get('/:id', getReport);
router.post('/', createReport);
router.patch('/:id/resolve', resolveReport);
router.patch('/:id/claim', claimReport);
router.delete('/:id', deleteReport);

export default router;