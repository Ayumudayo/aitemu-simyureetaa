// managers/rankManager.js
import prisma from '../utils/prisma.js';

// 공통 랭킹 조회 함수
const getRank = async (field, order) => {
  return await prisma.character.findMany({
    select: {
      name: true,
      power: true,
      health: true,
    },
    orderBy: {
      [field]: order,
    },
  });
};

// 공격력 내림차순 조회
export const getPowRank = async (req, res) => {
  const characters = await getRank('power', 'desc');
  const result = characters.map(({ health, ...rest }) => rest);
  res.status(200).json(result);
};

// 체력 내림차순 조회
export const getHpRank = async (req, res) => {
  const characters = await getRank('health', 'desc');
  const result = characters.map(({ power, ...rest }) => rest);
  res.status(200).json(result);
};

// 아이템 개수 내림차순 조회
// 착용된 아이템 및 인벤토리 포함
export const getItemCountRank = async (req, res) => {
  // _count(aggregate)
  const characters = await prisma.character.findMany({
    select: {
      name: true,
      inventory: {
        select: {
          count: true,
        },
      },
      _count: {
        select: {
          equippedItems: true,
        },
      },
    },
  });

  const sumCount = characters.map((character) => {
    const invCnt = character.inventory.reduce((sum, item) => sum + item.count, 0);
    const equipedCnt = character._count.equippedItems;
    const totalCnt = invCnt + equipedCnt;

    return {
      charaName: character.name,
      totalCnt,
    };
  });

  const sortedRank = sumCount.sort((a, b) => b.totalCnt - a.totalCnt);

  res.status(200).json(sortedRank);
};
