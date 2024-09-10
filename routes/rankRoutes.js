import express from 'express';
import { getPowRank, getHpRank } from '../managers/rankManager.js';

const router = express.Router();

router.get('/pow', getPowRank);
router.get('/hp', getHpRank);

export default router;
