import { Router } from 'express';
import { login, me, register } from '../controllers/index.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'ok' });
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);

export default router;
