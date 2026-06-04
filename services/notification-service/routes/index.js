import { Router } from 'express';
import { createNotification, getNotifications } from '../controllers/index.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'ok' });
});

router.get('/', authMiddleware, getNotifications);
router.post('/', authMiddleware, createNotification);

export default router;
