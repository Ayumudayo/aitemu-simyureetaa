import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  purchaseItem,
  sellItem,
} from '../managers/itemManager.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createItem);
router.get('/', getItems);
router.get('/:itemCode', getItemById);
router.patch('/:itemCode', updateItem);
router.post('/:characterId/purchase', authenticateToken, purchaseItem);
router.post('/:characterId/sell', authenticateToken, sellItem);

export default router;
