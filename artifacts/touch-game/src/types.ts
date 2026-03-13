export type CardType = "attack" | "magic" | "heal" | "shield" | "special";
export type Rarity = "common" | "rare" | "epic";
export type Page = "lobby" | "gacha" | "battle";

export interface CardDef {
  defId: string;
  type: CardType;
  name: string;
  emoji: string;
  color: string;
  desc: string;
  rarity: Rarity;
  minVal: number;
  maxVal: number;
}

export interface Card {
  uid: string;
  defId: string;
  type: CardType;
  name: string;
  emoji: string;
  color: string;
  desc: string;
  rarity: Rarity;
  value: number;
}

export interface GameState {
  coins: number;
  collection: Card[];
  deckUids: string[];
}

export interface Enemy {
  name: string;
  emoji: string;
  hp: number;
  atkMin: number;
  atkMax: number;
  reward: number;
}
