import express from 'express';
import { getPowRank, getHpRank, getItemCountRank } from '../managers/rankManager.js';

const router = express.Router();

router.get('/pow', getPowRank);
router.get('/hp', getHpRank);
router.get('/item', getItemCountRank);

export default router;
