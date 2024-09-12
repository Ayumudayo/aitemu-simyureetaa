// managers/itemManager.js
import prisma from '../utils/prisma.js';

// 아이템 생성
export const createItem = async (req, res) => {
  const { itemCode, itemName, itemStat, itemPrice } = req.body;

  if (!itemCode || !itemName || !itemStat || !itemPrice) {
    return res.status(400).json({ error: 'Check your input data' });
  }

  const existingItem = await prisma.item.findUnique({ where: { itemCode } });
  if (existingItem) {
    return res.status(409).json({ error: 'Item code already exists' });
  }

  const item = await prisma.item.create({
    data: {
      itemCode,
      itemName,
      itemStat,
      itemPrice,
    },
  });

  res.status(201).json(item);
};

// 아이템 목록 조회
export const getItems = async (req, res) => {
  const items = await prisma.item.findMany({
    select: {
      itemCode: true,
      itemName: true,
      itemPrice: true,
    },
  });
  res.status(200).json(items);
};

// 아이템 상세 조회
export const getItemById = async (req, res) => {
  const { itemCode } = req.params;

  const item = await prisma.item.findUnique({
    where: { itemCode: parseInt(itemCode) },
    select: {
      itemCode: true,
      itemName: true,
      itemStat: true,
      itemPrice: true,
    },
  });

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.status(200).json(item);
};

// 아이템 수정
export const updateItem = async (req, res) => {
  const { itemCode } = req.params;
  const { itemName, itemStat } = req.body;

  const updatedItem = await prisma.item.update({
    where: { itemCode: parseInt(itemCode) },
    data: {
      itemName,
      itemStat,
    },
  });

  res.status(200).json(updatedItem);
};

// 아이템 구입
export const purchaseItem = async (req, res) => {
  const { characterId } = req.params;
  const { itemsToPurchase } = req.body; // [{ itemCode: 1, count: 2 }, ...]

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
  });

  if (!character || character.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized or Character not found' });
  }

  let totalCost = 0;

  try {
    await prisma.$transaction(async (prisma) => {
      // 모든 아이템의 가격을 병렬로 계산
      const costPromises = itemsToPurchase.map(async (item) => {
        const dbItem = await prisma.item.findUnique({
          where: { itemCode: item.itemCode },
        });
        if (!dbItem) {
          throw new Error(`Item not found with code ${item.itemCode}`);
        }
        totalCost += dbItem.itemPrice * item.count;
      });

      // 모든 가격 계산을 병렬로 처리
      await Promise.all(costPromises);

      if (character.money < totalCost) {
        throw new Error('Not enough money');
      }

      // 아이템 구매 처리 병렬화
      const purchasePromises = itemsToPurchase.map(async (item) => {
        const dbItem = await prisma.item.findUnique({
          where: { itemCode: item.itemCode },
        });

        const existingInventoryItem = await prisma.inventory.findFirst({
          where: {
            characterId: parseInt(characterId),
            itemId: dbItem.id,
          },
        });

        if (existingInventoryItem) {
          // 이미 인벤토리에 있으면 count 업데이트
          await prisma.inventory.update({
            where: { id: existingInventoryItem.id },
            data: {
              count: { increment: item.count },
            },
          });
        } else {
          // 인벤토리에 없으면 새로 추가
          await prisma.inventory.create({
            data: {
              characterId: parseInt(characterId),
              itemId: dbItem.id,
              count: item.count,
            },
          });
        }
      });

      // 모든 아이템 구매 처리 병렬로 실행
      await Promise.all(purchasePromises);

      // 캐릭터의 게임 머니 감소 처리
      await prisma.character.update({
        where: { id: parseInt(characterId) },
        data: {
          money: { decrement: totalCost },
        },
      });
    });

    res.status(200).json({ message: 'Items purchased successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 아이템 판매
export const sellItem = async (req, res) => {
  const { characterId } = req.params;
  const { itemsToSell } = req.body; // [{ itemCode: 1, count: 1 }, ...]

  const character = await prisma.character.findUnique({
    where: { id: parseInt(characterId) },
  });

  if (!character || character.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized or Character not found' });
  }

  let totalSellValue = 0;

  try {
    await prisma.$transaction(async (prisma) => {
      const promises = itemsToSell.map(async (item) => {
        const dbItem = await prisma.item.findUnique({
          where: { itemCode: item.itemCode },
        });
        if (!dbItem) {
          throw new Error(`Item not found with code ${item.itemCode}`);
        }

        const inventoryItem = await prisma.inventory.findFirst({
          where: {
            characterId: parseInt(characterId),
            itemId: dbItem.id,
          },
        });

        if (!inventoryItem || inventoryItem.count < item.count) {
          throw new Error('Not enough items to sell');
        }

        const sellValue = Math.floor(dbItem.itemPrice * 0.6) * item.count;
        totalSellValue += sellValue;

        // 판매할 만큼의 아이템을 인벤토리에서 제거
        if (inventoryItem.count === item.count) {
          // 아이템의 개수가 정확히 판매량과 같다면 인벤토리에서 삭제
          await prisma.inventory.delete({
            where: { id: inventoryItem.id },
          });
        } else {
          // 그렇지 않다면 수량만 감소
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: {
              count: { decrement: item.count },
            },
          });
        }
      });

      // 모든 아이템 판매 Promise 병렬 실행
      await Promise.all(promises);

      // 캐릭터의 게임 머니 증가 처리
      await prisma.character.update({
        where: { id: parseInt(characterId) },
        data: {
          money: { increment: totalSellValue },
        },
      });
    });

    res.status(200).json({ message: 'Items sold successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

