import { Router } from 'express';
import {
  cancelEvent,
  cancelRsvp,
  createEvent,
  getEvent,
  getEvents,
  getMyEvents,
  rsvpEvent,
} from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'events-service', status: 'ok' });
});

router.get('/', getEvents);
router.get('/my', getMyEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.post('/:id/rsvp', rsvpEvent);
router.delete('/:id/rsvp', cancelRsvp);
router.delete('/:id', cancelEvent);

export default router;