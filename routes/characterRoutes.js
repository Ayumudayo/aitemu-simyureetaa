import express from "express";
import {
  createCharacter,
  deleteCharacter,
  getCharacterDetails,
  getInventory,
  getCurrentEquipment,
  equipItem,
  unequipItem,
  doMining,
} from "../managers/characterManager.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createCharacter);
router.delete("/:characterId", authenticateToken, deleteCharacter);
router.get("/:characterId", getCharacterDetails);
router.get("/:characterId/getequip", getCurrentEquipment);
router.get("/:characterId/getinv", authenticateToken, getInventory);
router.post("/:characterId/equip", authenticateToken, equipItem);
router.post("/:characterId/unequip", authenticateToken, unequipItem);
router.post("/:characterId/mining", authenticateToken, doMining);

export default router;

