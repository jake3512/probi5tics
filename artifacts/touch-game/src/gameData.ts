import type { CardDef, Card, Enemy } from "./types";

let uidCounter = 0;
export function makeUid() {
  return `card-${Date.now()}-${uidCounter++}`;
}

export const CARD_DEFS: CardDef[] = [
  // Common
  { defId: "slash",   type: "attack",  name: "검격",     emoji: "⚔️",  color: "#ef4444", desc: "적에게 데미지",      rarity: "common", minVal: 4, maxVal: 7 },
  { defId: "arrow",   type: "attack",  name: "화살",     emoji: "🏹",  color: "#f97316", desc: "적에게 데미지",      rarity: "common", minVal: 3, maxVal: 6 },
  { defId: "heal",    type: "heal",    name: "치유",     emoji: "💚",  color: "#22c55e", desc: "HP 회복",           rarity: "common", minVal: 4, maxVal: 7 },
  { defId: "potion",  type: "heal",    name: "포션",     emoji: "🧪",  color: "#10b981", desc: "HP 회복",           rarity: "common", minVal: 3, maxVal: 6 },
  { defId: "shield",  type: "shield",  name: "방패",     emoji: "🛡️",  color: "#3b82f6", desc: "다음 공격 방어",    rarity: "common", minVal: 4, maxVal: 7 },
  { defId: "barrier", type: "shield",  name: "결계",     emoji: "💠",  color: "#6366f1", desc: "다음 공격 방어",    rarity: "common", minVal: 3, maxVal: 6 },
  // Rare
  { defId: "fireball",type: "magic",   name: "파이어볼", emoji: "🔥",  color: "#f59e0b", desc: "강한 마법 공격",    rarity: "rare",   minVal: 7, maxVal: 11 },
  { defId: "thunder", type: "magic",   name: "번개",     emoji: "⚡",  color: "#eab308", desc: "강한 마법 공격",    rarity: "rare",   minVal: 6, maxVal: 10 },
  { defId: "bigheal", type: "heal",    name: "대치유",   emoji: "💖",  color: "#4ade80", desc: "많은 HP 회복",      rarity: "rare",   minVal: 8, maxVal: 12 },
  { defId: "bigshield",type:"shield",  name: "마법방패", emoji: "🔮",  color: "#818cf8", desc: "강한 방어",         rarity: "rare",   minVal: 8, maxVal: 12 },
  { defId: "icespear",type: "magic",   name: "빙창",     emoji: "🧊",  color: "#7dd3fc", desc: "마법 공격",         rarity: "rare",   minVal: 8, maxVal: 11 },
  // Epic
  { defId: "finisher",type: "special", name: "필살기",   emoji: "💥",  color: "#ec4899", desc: "막대한 데미지!",    rarity: "epic",   minVal: 15, maxVal: 22 },
  { defId: "revive",  type: "special", name: "부활의빛", emoji: "✨",  color: "#fde68a", desc: "HP 15 회복",        rarity: "epic",   minVal: 15, maxVal: 15 },
  { defId: "dragon",  type: "special", name: "용의숨결", emoji: "🐉",  color: "#f43f5e", desc: "강력한 불꽃 공격!", rarity: "epic",   minVal: 18, maxVal: 25 },
  { defId: "timestop",type: "special", name: "시간정지", emoji: "⏰",  color: "#a855f7", desc: "적 행동 무효화",    rarity: "epic",   minVal: 0,  maxVal: 0 },
];

export function rollCard(): Card {
  const r = Math.random();
  let pool: CardDef[];
  if (r < 0.05) pool = CARD_DEFS.filter((d) => d.rarity === "epic");
  else if (r < 0.30) pool = CARD_DEFS.filter((d) => d.rarity === "rare");
  else pool = CARD_DEFS.filter((d) => d.rarity === "common");
  const def = pool[Math.floor(Math.random() * pool.length)];
  const value = def.minVal + Math.floor(Math.random() * (def.maxVal - def.minVal + 1));
  return { uid: makeUid(), defId: def.defId, type: def.type, name: def.name, emoji: def.emoji, color: def.color, desc: def.desc, rarity: def.rarity, value };
}

export const RARITY_LABEL: Record<string, { label: string; color: string }> = {
  common: { label: "일반", color: "#94a3b8" },
  rare:   { label: "레어", color: "#60a5fa" },
  epic:   { label: "에픽", color: "#c084fc" },
};

export const ENEMIES: Enemy[] = [
  { name: "슬라임",    emoji: "🟢", hp: 20, atkMin: 3, atkMax: 5, reward: 15 },
  { name: "트롤",      emoji: "👹", hp: 28, atkMin: 4, atkMax: 7, reward: 20 },
  { name: "골렘",      emoji: "🪨", hp: 35, atkMin: 5, atkMax: 8, reward: 25 },
  { name: "드래곤",    emoji: "🐉", hp: 45, atkMin: 6, atkMax: 10,reward: 35 },
  { name: "마왕",      emoji: "👿", hp: 55, atkMin: 7, atkMax: 12,reward: 50 },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const STARTER_CARDS: Card[] = [
  { uid: makeUid(), defId: "slash",  type: "attack", name: "검격",  emoji: "⚔️", color: "#ef4444", desc: "적에게 데미지", rarity: "common", value: 5 },
  { uid: makeUid(), defId: "heal",   type: "heal",   name: "치유",  emoji: "💚", color: "#22c55e", desc: "HP 회복",      rarity: "common", value: 5 },
  { uid: makeUid(), defId: "shield", type: "shield", name: "방패",  emoji: "🛡️", color: "#3b82f6", desc: "다음 공격 방어", rarity: "common", value: 5 },
  { uid: makeUid(), defId: "arrow",  type: "attack", name: "화살",  emoji: "🏹", color: "#f97316", desc: "적에게 데미지", rarity: "common", value: 4 },
  { uid: makeUid(), defId: "potion", type: "heal",   name: "포션",  emoji: "🧪", color: "#10b981", desc: "HP 회복",      rarity: "common", value: 4 },
  { uid: makeUid(), defId: "barrier",type: "shield", name: "결계",  emoji: "💠", color: "#6366f1", desc: "다음 공격 방어", rarity: "common", value: 4 },
];
