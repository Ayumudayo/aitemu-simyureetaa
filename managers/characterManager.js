// managers/characterManager.js
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

// 캐릭터 생성
export const createCharacter = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  const existingCharacter = await prisma.character.findUnique({
    where: { name },
  });
  if (existingCharacter) {
    return res.status(409).json({ error: "Character name already taken" });
  }

  const character = await prisma.character.create({
    data: {
      name,
      userId,
      health: 500,
      power: 100,
      money: 10000,
    },
  });

  res.status(201).json(character.id);
};

// 캐릭터 삭제
export const deleteCharacter = async (req, res) => {
  const { characterId } = req.params;
  const userId = req.user.userId;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
  });

  if (!character || character.userId !== userId) {
    return res
      .status(403)
      .json({ error: "Unauthorized or Character not found" });
  }

  await prisma.character.delete({ where: { id: parseInt(characterId) } });
  res.status(200).json({ message: "Character deleted successfully" });
};

// 캐릭터 상세 조회
// 이름, 스탯 조회
// 내 캐릭터일 시 돈까지 조회
export const getCharacterDetails = async (req, res) => {
  const { characterId } = req.params;
  const token = req.headers["authorization"].split(" ");
  let currentUserId;

  if (!token)
  if (token[0] !== "Bearer")
    currentUserId = -1;

  jwt.verify(token[1], process.env.JWT_SECRET, (err, user) => {
    if (err) currentUserId = -1;
    currentUserId = user.userId;
  });

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    select: {
      userId: true,
      name: true,
      health: true,
      power: true,
      money: true,
    },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  // 현재 로그인한 유저와 캐릭터 소유자의 ID가 다른 경우 money 필드 제거
  if (character.userId !== currentUserId) {
    delete character.money;
  }
  delete character.userId;

  res.status(200).json(character);
};

export const getInventory = async (req, res) => {
  const { characterId } = req.params;
  const currentUserId = req.user.userId;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    select: {
      userId: true,
      inventory: {
        include: { item: true },
      },
    },
  });

  if (!character || character.userId !== currentUserId) {
    return res.status(403).json({ error: "Unauthorized or Character not found" });
  }
  delete character.userId;
  res.status(200).json(character);
};

// 장착 중 아이템 조회
export const getCurrentEquipment = async (req, res) => {
  const { characterId } = req.params;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    select: {
      equippedItems: {
        include: { item: true },
      },
    },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  res.status(200).json(character);
};

// 아이템 장착
// 스탯 반영
// attack은 power
// defense는 health
export const equipItem = async (req, res) => {
  const { characterId } = req.params;
  const { itemCode } = req.body;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    include: { inventory: true },
  });

  if (!character || character.userId !== req.user.userId) {
    return res.status(403).json({ error: "Unauthorized or Character not found" });
  }

  const itemInInventory = character.inventory.find(
    (inv) => inv.itemId === itemCode
  );
  if (!itemInInventory) {
    return res.status(404).json({ error: "Item not in inventory" });
  }

  const item = await prisma.item.findUnique({
    where: { itemCode: itemCode },
  });

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  await prisma.equippedItem.create({
    data: {
      characterId: parseInt(characterId),
      itemId: itemCode,
    },
  });

  const updatedInventory = await prisma.inventory.update({
    where: { id: itemInInventory.id },
    data: { count: { decrement: 1 } },
  });

  // 만약 아이템 수량이 0이 되면 인벤토리에서 제거
  if (updatedInventory.count === 0) {
    await prisma.inventory.delete({
      where: { id: itemInInventory.id },
    });
  }

  const itemStats = item.itemStat;
  const attack = itemStats.attack || 0;
  const defense = itemStats.defense || 0;

  await prisma.character.update({
    where: { id: parseInt(characterId) },
    data: {
      health: character.health + defense,
      power: character.power + attack,
    },
  });

  res.status(200).json({ message: "Item equipped successfully" });
};

// 아이템 탈착
// 스탯 반영
// attack은 power
// defense는 health
export const unequipItem = async (req, res) => {
  const { characterId } = req.params;
  const { itemCode } = req.body;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    include: { equippedItems: true },
  });

  if (!character || character.userId !== req.user.userId) {
    return res.status(403).json({ error: "Unauthorized or Character not found" });
  }

  const itemEquipped = character.equippedItems.find(
    (equip) => equip.itemId === itemCode
  );
  if (!itemEquipped) {
    return res.status(404).json({ error: "Item not equipped" });
  }

  // 아이템 장착 해제 처리
  await prisma.equippedItem.delete({
    where: { id: itemEquipped.id },
  });

  // 해당 아이템이 인벤토리에 있는지 확인
  const inventoryItem = await prisma.inventory.findFirst({
    where: {
      characterId: parseInt(characterId),
      itemId: itemCode,
    },
  });

  if (inventoryItem) {
    // 인벤토리에 이미 있으면 count 증가
    await prisma.inventory.update({
      where: { id: inventoryItem.id },
      data: {
        count: { increment: 1 },
      },
    });
  } else {
    // 인벤토리에 없으면 새로 생성
    await prisma.inventory.create({
      data: {
        characterId: parseInt(characterId),
        itemId: itemCode,
        count: 1,
      },
    });
  }

  const item = await prisma.item.findUnique({
    where: { itemCode: itemCode },
  });

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const itemStats = item.itemStat;
  const attack = itemStats.attack || 0;
  const defense = itemStats.defense || 0;

  await prisma.character.update({
    where: { id: parseInt(characterId) },
    data: {
      health: character.health - defense,
      power: character.power - attack,
    },
  });

  res.status(200).json({ message: "Item unequipped successfully" });
};

// 캐릭터의 게임 머니를 증가시키는 함수
export const doMining = async (req, res) => {
  const { characterId } = req.params;
  const currentUserId = req.user.userId; // 현재 요청을 보낸 계정의 userId

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  // 캐릭터의 소유자(userId)와 현재 요청을 보낸 계정의 userId 비교
  if (character.userId !== currentUserId) {
    return res.status(403).json({ error: "You do not own this character" });
  }

  const updatedCharacter = await prisma.character.update({
    where: { id: parseInt(characterId) },
    data: { money: character.money + 100 },
  });

  res.status(200).json({ money: updatedCharacter.money });
};