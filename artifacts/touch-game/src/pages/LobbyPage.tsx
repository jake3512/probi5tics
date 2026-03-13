import type { GameState, Card, Page } from "../types";
import { RARITY_INFO } from "../gameData";

interface Props {
  state: GameState;
  onNavigate: (p: Page) => void;
  onToggleDeck: (uid: string) => void;
}

function CardMini({ card, selected, onToggle }: { card: Card; selected: boolean; onToggle: () => void }) {
  const ri = RARITY_INFO[card.rarity];
  return (
    <div
      onClick={onToggle}
      style={{
        width: 68,
        background: selected
          ? `linear-gradient(135deg, ${card.color}44, ${card.color}18)`
          : "rgba(255,255,255,0.04)",
        border: `2px solid ${selected ? card.color : "rgba(255,255,255,0.12)"}`,
        borderRadius: 12,
        padding: "6px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        boxShadow: selected ? `0 0 14px ${card.color}66` : "none",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: -6, right: -6,
          width: 18, height: 18,
          background: "#22c55e", borderRadius: 99,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "white", fontWeight: "bold",
        }}>✓</div>
      )}
      <div style={{ fontSize: 22 }}>{card.emoji}</div>
      <div style={{ color: "white", fontSize: 9, fontWeight: "bold", textAlign: "center", marginTop: 2, lineHeight: 1.2 }}>{card.name}</div>
      <div style={{ color: ri.color, fontSize: 8, marginTop: 1 }}>{ri.label}</div>
      <div style={{ color: card.color, fontWeight: "bold", fontSize: 12 }}>
        {card.value}{card.value2 ? `+` : ""}
      </div>
    </div>
  );
}

// Group cards by rarity order
const RARITY_ORDER = ["mythic", "endangered", "rare", "uncommon", "common"] as const;

export default function LobbyPage({ state, onNavigate, onToggleDeck }: Props) {
  const { coins, freeGachaLeft, collection, deckUids } = state;
  const deckFull = deckUids.length === 8;

  const deckCards = deckUids
    .map(uid => collection.find(c => c.uid === uid))
    .filter(Boolean) as Card[];

  // Sort collection: rarity desc, then name
  const sorted = [...collection].sort((a, b) => {
    const ro = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    if (ro !== 0) return ro;
    return a.name.localeCompare(b.name);
  });

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
        paddingBottom: 28,
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

      {/* Deck */}
      <div style={{ margin: "14px 16px 0", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: "bold", fontSize: 14 }}>
            🗂️ 전투 덱 <span style={{ color: deckFull ? "#4ade80" : "#facc15" }}>({deckUids.length}/8)</span>
          </span>
          {!deckFull
            ? <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>보유 카드를 탭해서 추가</span>
            : <span style={{ color: "#4ade80", fontSize: 11 }}>✅ 덱 완성!</span>
          }
        </div>
        {deckCards.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center", padding: "14px 0" }}>
            카드를 선택해 덱을 구성하세요
          </div>
        ) : (
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
            {deckCards.map(c => (
              <CardMini key={c.uid} card={c} selected onToggle={() => onToggleDeck(c.uid)} />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, padding: "12px 16px 0" }}>
        <button
          onClick={() => onNavigate("gacha")}
          style={{
            flex: 1, padding: "14px 0",
            background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
            border: freeGachaLeft > 0 ? "2px solid #4ade80" : "none",
            borderRadius: 14, color: "white", fontSize: 15, fontWeight: "bold",
            cursor: "pointer", boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            position: "relative",
          }}
        >
          🎲 뽑기
          {freeGachaLeft > 0 && (
            <span style={{ position: "absolute", top: -8, right: -8, background: "#22c55e", borderRadius: 99, fontSize: 11, padding: "2px 7px", fontWeight: "bold", color: "white" }}>
              무료 {freeGachaLeft}회
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate("battle")}
          disabled={!deckFull}
          style={{
            flex: 1, padding: "14px 0",
            background: deckFull
              ? "linear-gradient(135deg, #dc2626, #991b1b)"
              : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: 14,
            color: deckFull ? "white" : "rgba(255,255,255,0.25)",
            fontSize: 15, fontWeight: "bold",
            cursor: deckFull ? "pointer" : "default",
            boxShadow: deckFull ? "0 0 20px rgba(220,38,38,0.4)" : "none",
          }}
        >
          ⚔️ 전투{!deckFull && <><br/><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{8 - deckUids.length}장 더 필요</span></>}
        </button>
      </div>

      {/* Collection */}
      <div style={{ margin: "16px 16px 0" }}>
        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 10, color: "rgba(255,255,255,0.6)", display: "flex", justifyContent: "space-between" }}>
          <span>📦 보유 카드 ({collection.length}장)</span>
          {collection.length > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>탭으로 덱 추가/제거</span>}
        </div>

        {collection.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "center", padding: "32px 0", lineHeight: 2 }}>
            카드가 없습니다.<br />
            뽑기를 통해 카드를 획득하세요!<br />
            <span style={{ color: "#4ade80", fontSize: 12 }}>🎁 무료 뽑기 {freeGachaLeft}회 남음</span>
          </div>
        ) : (
          <>
            {RARITY_ORDER.map(rarity => {
              const group = sorted.filter(c => c.rarity === rarity);
              if (group.length === 0) return null;
              const ri = RARITY_INFO[rarity];
              return (
                <div key={rarity} style={{ marginBottom: 14 }}>
                  <div style={{ color: ri.color, fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>
                    {ri.label} ({group.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {group.map(card => (
                      <CardMini
                        key={card.uid}
                        card={card}
                        selected={deckUids.includes(card.uid)}
                        onToggle={() => onToggleDeck(card.uid)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
