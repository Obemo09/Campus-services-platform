import { Router } from 'express';
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  getMyItems,
  markAsSold,
} from '../controllers/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ service: 'marketplace-service', status: 'ok' });
});

router.get('/', getItems);
router.get('/my', getMyItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.patch('/:id/sold', markAsSold);
router.delete('/:id', deleteItem);

export default router;