import type { CardDef, Card, Enemy, Rarity } from "./types";

let uidCounter = 0;
export function makeUid() {
  return `card-${Date.now()}-${uidCounter++}`;
}

// ─── 38 Unique Cards ───────────────────────────────────────────────────────
// Common (일반) × 20 | Uncommon (남다름) × 10 | Rare (희귀) × 5
// Endangered (멸종위기) × 2 | Mythic (신화) × 1

export const CARD_DEFS: CardDef[] = [
  // ── 일반 (Common) ──────────────────────────────────────────────────────
  { defId:"c01", rarity:"common",     type:"attack",  name:"검격",     emoji:"⚔️",  color:"#94a3b8", value:4,  desc:"적에게 4 데미지" },
  { defId:"c02", rarity:"common",     type:"attack",  name:"화살",     emoji:"🏹",  color:"#94a3b8", value:3,  desc:"적에게 3 데미지" },
  { defId:"c03", rarity:"common",     type:"attack",  name:"돌팔매",   emoji:"🪨",  color:"#94a3b8", value:3,  desc:"적에게 3 데미지" },
  { defId:"c04", rarity:"common",     type:"attack",  name:"주먹질",   emoji:"👊",  color:"#94a3b8", value:4,  desc:"적에게 4 데미지" },
  { defId:"c05", rarity:"common",     type:"attack",  name:"발차기",   emoji:"🦵",  color:"#94a3b8", value:3,  desc:"적에게 3 데미지" },
  { defId:"c06", rarity:"common",     type:"attack",  name:"단검",     emoji:"🗡️",  color:"#94a3b8", value:5,  desc:"적에게 5 데미지" },
  { defId:"c07", rarity:"common",     type:"attack",  name:"막대기",   emoji:"🪵",  color:"#94a3b8", value:4,  desc:"적에게 4 데미지" },
  { defId:"c08", rarity:"common",     type:"attack",  name:"짧은창",   emoji:"🪃",  color:"#94a3b8", value:5,  desc:"적에게 5 데미지" },
  { defId:"c09", rarity:"common",     type:"heal",    name:"치유",     emoji:"💚",  color:"#94a3b8", value:4,  desc:"HP 4 회복" },
  { defId:"c10", rarity:"common",     type:"heal",    name:"포션",     emoji:"🧪",  color:"#94a3b8", value:3,  desc:"HP 3 회복" },
  { defId:"c11", rarity:"common",     type:"heal",    name:"붕대",     emoji:"🩹",  color:"#94a3b8", value:3,  desc:"HP 3 회복" },
  { defId:"c12", rarity:"common",     type:"heal",    name:"허브",     emoji:"🌿",  color:"#94a3b8", value:3,  desc:"HP 3 회복" },
  { defId:"c13", rarity:"common",     type:"heal",    name:"물약",     emoji:"🫙",  color:"#94a3b8", value:4,  desc:"HP 4 회복" },
  { defId:"c14", rarity:"common",     type:"shield",  name:"방패",     emoji:"🛡️",  color:"#94a3b8", value:4,  desc:"방어 4 획득" },
  { defId:"c15", rarity:"common",     type:"shield",  name:"나무방패", emoji:"🪵",  color:"#94a3b8", value:3,  desc:"방어 3 획득" },
  { defId:"c16", rarity:"common",     type:"shield",  name:"작은방패", emoji:"🔰",  color:"#94a3b8", value:3,  desc:"방어 3 획득" },
  { defId:"c17", rarity:"common",     type:"shield",  name:"돌벽",     emoji:"🧱",  color:"#94a3b8", value:4,  desc:"방어 4 획득" },
  { defId:"c18", rarity:"common",     type:"shield",  name:"갑옷",     emoji:"🦺",  color:"#94a3b8", value:5,  desc:"방어 5 획득" },
  { defId:"c19", rarity:"common",     type:"attack",  name:"투석",     emoji:"🎯",  color:"#94a3b8", value:4,  desc:"적에게 4 데미지" },
  { defId:"c20", rarity:"common",     type:"heal",    name:"안식",     emoji:"🌼",  color:"#94a3b8", value:5,  desc:"HP 5 회복" },

  // ── 남다름 (Uncommon) ──────────────────────────────────────────────────
  { defId:"u01", rarity:"uncommon",   type:"magic",   name:"파이어볼", emoji:"🔥",  color:"#60a5fa", value:8,  desc:"적에게 8 마법 데미지" },
  { defId:"u02", rarity:"uncommon",   type:"attack",  name:"번개화살", emoji:"⚡",  color:"#60a5fa", value:8,  desc:"적에게 8 데미지" },
  { defId:"u03", rarity:"uncommon",   type:"attack",  name:"독화살",   emoji:"🐍",  color:"#60a5fa", value:7,  desc:"적에게 7 데미지" },
  { defId:"u04", rarity:"uncommon",   type:"attack",  name:"이중검격", emoji:"⚔️⚔️",color:"#60a5fa",value:10, desc:"적에게 10 데미지" },
  { defId:"u05", rarity:"uncommon",   type:"magic",   name:"냉기화살", emoji:"🧊",  color:"#60a5fa", value:7,  desc:"적에게 7 마법 데미지" },
  { defId:"u06", rarity:"uncommon",   type:"heal",    name:"대치유",   emoji:"💖",  color:"#60a5fa", value:9,  desc:"HP 9 회복" },
  { defId:"u07", rarity:"uncommon",   type:"heal",    name:"마법포션", emoji:"✨",  color:"#60a5fa", value:8,  desc:"HP 8 회복" },
  { defId:"u08", rarity:"uncommon",   type:"heal",    name:"활력",     emoji:"💪",  color:"#60a5fa", value:8,  desc:"HP 8 회복" },
  { defId:"u09", rarity:"uncommon",   type:"shield",  name:"마법방패", emoji:"🔮",  color:"#60a5fa", value:9,  desc:"방어 9 획득" },
  { defId:"u10", rarity:"uncommon",   type:"shield",  name:"철벽",     emoji:"🏰",  color:"#60a5fa", value:8,  desc:"방어 8 획득" },

  // ── 희귀 (Rare) ────────────────────────────────────────────────────────
  { defId:"r01", rarity:"rare",       type:"magic",   name:"번개폭풍", emoji:"🌩️",  color:"#a78bfa", value:12, desc:"적에게 12 마법 데미지" },
  { defId:"r02", rarity:"rare",       type:"magic",   name:"얼음창",   emoji:"❄️",  color:"#a78bfa", value:11, desc:"적에게 11 마법 데미지" },
  { defId:"r03", rarity:"rare",       type:"heal",    name:"성스러운빛",emoji:"☀️", color:"#a78bfa", value:14, desc:"HP 14 회복" },
  { defId:"r04", rarity:"rare",       type:"shield",  name:"수호방패", emoji:"💎",  color:"#a78bfa", value:13, desc:"방어 13 획득" },
  { defId:"r05", rarity:"rare",       type:"attack",  name:"쌍검",     emoji:"🗡️⚔️",color:"#a78bfa",value:13, desc:"적에게 13 데미지" },

  // ── 멸종위기 (Endangered) ─────────────────────────────────────────────
  { defId:"e01", rarity:"endangered", type:"special", name:"용의숨결", emoji:"🐉",  color:"#f97316", value:20, desc:"적에게 20 불꽃 데미지" },
  { defId:"e02", rarity:"endangered", type:"special", name:"천공방어", emoji:"🌟",  color:"#f97316", value:16, value2:8, desc:"방어 16 + HP 8 회복" },

  // ── 신화 (Mythic) ──────────────────────────────────────────────────────
  { defId:"m01", rarity:"mythic",     type:"special", name:"세계의끝", emoji:"🌌",  color:"#ec4899", value:25, desc:"적에게 25 데미지 + 적 행동 무효" },
];

export const RARITY_INFO: Record<string, { label: string; color: string; chance: number }> = {
  common:     { label: "일반",     color: "#94a3b8", chance: 0.60 },
  uncommon:   { label: "남다름",   color: "#60a5fa", chance: 0.25 },
  rare:       { label: "희귀",     color: "#a78bfa", chance: 0.10 },
  endangered: { label: "멸종위기", color: "#f97316", chance: 0.04 },
  mythic:     { label: "신화",     color: "#ec4899", chance: 0.01 },
};

const POOL_BY_RARITY: Record<Rarity, CardDef[]> = {
  common:     CARD_DEFS.filter(d => d.rarity === "common"),
  uncommon:   CARD_DEFS.filter(d => d.rarity === "uncommon"),
  rare:       CARD_DEFS.filter(d => d.rarity === "rare"),
  endangered: CARD_DEFS.filter(d => d.rarity === "endangered"),
  mythic:     CARD_DEFS.filter(d => d.rarity === "mythic"),
};

export function rollCard(): Card {
  const r = Math.random();
  let rarity: Rarity;
  if (r < 0.01)       rarity = "mythic";
  else if (r < 0.05)  rarity = "endangered";
  else if (r < 0.15)  rarity = "rare";
  else if (r < 0.40)  rarity = "uncommon";
  else                rarity = "common";

  const pool = POOL_BY_RARITY[rarity];
  const def = pool[Math.floor(Math.random() * pool.length)];
  return {
    uid: makeUid(),
    defId: def.defId,
    type: def.type,
    name: def.name,
    emoji: def.emoji,
    color: def.color,
    desc: def.desc,
    rarity: def.rarity,
    value: def.value,
    value2: def.value2,
  };
}

export function rollThree(): Card[] {
  return [rollCard(), rollCard(), rollCard()];
}

export const ENEMIES: Enemy[] = [
  { name: "슬라임",  emoji: "🟢", hp: 20, atkMin: 3,  atkMax: 5,  reward: 15 },
  { name: "트롤",    emoji: "👹", hp: 30, atkMin: 4,  atkMax: 7,  reward: 20 },
  { name: "골렘",    emoji: "🪨", hp: 40, atkMin: 5,  atkMax: 9,  reward: 28 },
  { name: "드래곤",  emoji: "🐉", hp: 55, atkMin: 7,  atkMax: 12, reward: 40 },
  { name: "마왕",    emoji: "👿", hp: 70, atkMin: 9,  atkMax: 15, reward: 60 },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
