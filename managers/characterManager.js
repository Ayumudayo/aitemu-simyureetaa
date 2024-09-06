// managers/characterManager.js
import prisma from "../utils/prisma.js";

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

  res.json(character);
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
  res.json({ message: "Character deleted successfully" });
};

// 캐릭터 상세 조회
export const getCharacterDetails = async (req, res) => {
  const { characterId } = req.params;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    include: {
      inventory: {
        include: { item: true },
      },
      equippedItems: {
        include: { item: true },
      },
    },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  res.json(character);
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
  
    res.json(character);
  };

// 아이템 장착
export const equipItem = async (req, res) => {
  const { characterId } = req.params;
  const { itemCode } = req.body;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
    include: { inventory: true },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  const itemInInventory = character.inventory.find(
    (inv) => inv.itemId === itemCode
  );
  if (!itemInInventory) {
    return res.status(404).json({ error: "Item not in inventory" });
  }

  await prisma.equippedItem.create({
    data: {
      characterId: parseInt(characterId),
      itemId: itemCode,
    },
  });

  await prisma.inventory.update({
    where: { id: itemInInventory.id },
    data: { count: { decrement: 1 } },
  });

  res.json({ message: "Item equipped successfully" });
};

// 아이템 탈착
export const unequipItem = async (req, res) => {
    const { characterId } = req.params;
    const { itemCode } = req.body;
  
    const character = await prisma.character.findUnique({
      where: { id: parseInt(characterId) },
      include: { equippedItems: true },
    });
  
    if (!character) {
      return res.status(404).json({ error: "Character not found" });
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
  
    res.json({ message: "Item unequipped successfully" });
  };
  

// 캐릭터의 게임 머니를 증가시키는 함수
export const doMining = async (req, res) => {
  const { characterId } = req.params;

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
  });

  if (!character) {
    return res.status(404).json({ error: "Character not found" });
  }

  // 게임 머니 100 증가
  const updatedCharacter = await prisma.character.update({
    where: { id: parseInt(characterId) },
    data: { money: character.money + 100 },
  });

  res.json({ money: updatedCharacter.money });
};
