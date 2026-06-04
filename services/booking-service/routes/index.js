import { Router } from 'express';
import {
  cancelBooking, confirmBooking, createBooking,
  createFacility, deleteFacility, getAllBookings,
  getFacilities, getMyBookings, rejectBooking, updateFacility,
} from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => res.json({ service: 'booking-service', status: 'ok' }));
router.get('/facilities', getFacilities);
router.post('/facilities', createFacility);
router.patch('/facilities/:id', updateFacility);
router.delete('/facilities/:id', deleteFacility);
router.get('/all', getAllBookings);
router.get('/my', getMyBookings);
router.post('/', createBooking);
router.patch('/:id/confirm', confirmBooking);
router.patch('/:id/reject', rejectBooking);
router.delete('/:id', cancelBooking);

export default router;