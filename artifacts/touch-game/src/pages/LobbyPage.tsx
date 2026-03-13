import type { GameState, Card, Page } from "../types";
import { RARITY_LABEL } from "../gameData";

interface Props {
  state: GameState;
  onNavigate: (p: Page) => void;
  onToggleDeck: (uid: string) => void;
}

function CardMini({ card, selected, onToggle }: { card: Card; selected: boolean; onToggle: () => void }) {
  const rl = RARITY_LABEL[card.rarity];
  return (
    <div
      onClick={onToggle}
      style={{
        width: 70,
        background: selected
          ? `linear-gradient(135deg, ${card.color}44, ${card.color}22)`
          : "rgba(255,255,255,0.05)",
        border: `2px solid ${selected ? card.color : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        padding: "6px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        boxShadow: selected ? `0 0 12px ${card.color}66` : "none",
        flexShrink: 0,
      }}
    >
      {selected && (
        <div
          style={{
            position: "absolute",
            top: -6, right: -6,
            width: 18, height: 18,
            background: "#22c55e",
            borderRadius: 99,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "white", fontWeight: "bold",
          }}
        >✓</div>
      )}
      <div style={{ fontSize: 24 }}>{card.emoji}</div>
      <div style={{ color: "white", fontSize: 10, fontWeight: "bold", textAlign: "center", marginTop: 2 }}>{card.name}</div>
      <div style={{ color: rl.color, fontSize: 9 }}>{rl.label}</div>
      <div style={{ color: card.color, fontWeight: "bold", fontSize: 13 }}>{card.value}</div>
    </div>
  );
}

export default function LobbyPage({ state, onNavigate, onToggleDeck }: Props) {
  const { coins, collection, deckUids } = state;
  const deckFull = deckUids.length === 8;

  const deckCards = deckUids
    .map((uid) => collection.find((c) => c.uid === uid))
    .filter(Boolean) as Card[];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #1a0533 0%, #0d1b4b 50%, #0a0a1a 100%)",
        display: "flex",
        flexDirection: "column",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        overflowY: "auto",
        paddingBottom: 24,
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", color: "#facc15", textShadow: "0 0 16px #facc15" }}>
          🃏 카드 배틀
        </h1>
        <div style={{ background: "rgba(250,204,21,0.15)", border: "1px solid #facc15", borderRadius: 99, padding: "4px 14px", fontSize: 15, color: "#facc15", fontWeight: "bold" }}>
          💰 {coins}
        </div>
      </div>

      {/* Deck Section */}
      <div style={{ margin: "16px 16px 0", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: "bold", fontSize: 14 }}>
            🗂️ 전투 덱 <span style={{ color: deckFull ? "#4ade80" : "#facc15" }}>({deckUids.length}/8)</span>
          </span>
          {!deckFull && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>카드를 탭해서 추가</span>
          )}
          {deckFull && (
            <span style={{ color: "#4ade80", fontSize: 11 }}>✅ 덱 완성!</span>
          )}
        </div>
        {deckCards.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
            아래에서 카드를 선택하세요
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {deckCards.map((c) => (
              <CardMini key={c.uid} card={c} selected onToggle={() => onToggleDeck(c.uid)} />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, padding: "14px 16px 0" }}>
        <button
          onClick={() => onNavigate("gacha")}
          style={{
            flex: 1, padding: "14px 0",
            background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
            border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: "bold",
            cursor: "pointer", boxShadow: "0 0 20px rgba(124,58,237,0.4)",
          }}
        >
          🎲 뽑기
        </button>
        <button
          onClick={() => onNavigate("battle")}
          disabled={!deckFull}
          style={{
            flex: 1, padding: "14px 0",
            background: deckFull
              ? "linear-gradient(135deg, #dc2626, #991b1b)"
              : "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 14,
            color: deckFull ? "white" : "rgba(255,255,255,0.3)",
            fontSize: 16, fontWeight: "bold",
            cursor: deckFull ? "pointer" : "default",
            boxShadow: deckFull ? "0 0 20px rgba(220,38,38,0.4)" : "none",
          }}
        >
          ⚔️ 전투
        </button>
      </div>

      {/* Collection */}
      <div style={{ margin: "16px 16px 0" }}>
        <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>
          📦 보유 카드 ({collection.length}장)
        </div>
        {collection.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
            카드가 없습니다. 뽑기를 해보세요!
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {collection.map((card) => (
              <CardMini
                key={card.uid}
                card={card}
                selected={deckUids.includes(card.uid)}
                onToggle={() => onToggleDeck(card.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
