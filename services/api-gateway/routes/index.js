import { Router } from 'express';
import { getGatewayStatus } from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

router.get('/', getGatewayStatus);

export default router;
