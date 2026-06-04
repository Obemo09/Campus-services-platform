import { Router } from 'express';
import {
  cancelRide, createRide, getJoinedRides,
  getMyRides, getRide, getRides, joinRide, leaveRide,
} from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => res.json({ service: 'carpooling-service', status: 'ok' }));
router.get('/', getRides);
router.get('/my', getMyRides);
router.get('/joined', getJoinedRides);
router.get('/:id', getRide);
router.post('/', createRide);
router.post('/:id/join', joinRide);
router.delete('/:id/leave', leaveRide);
router.patch('/:id/cancel', cancelRide);

export default router;