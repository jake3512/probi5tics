import { useState, useCallback } from "react";
import type { Card } from "../types";
import { rollThree, RARITY_INFO } from "../gameData";

interface Props {
  coins: number;
  freeLeft: number;
  onDraw: (cards: Card[], usedFree: boolean) => void;
  onBack: () => void;
}

const PULL_COST = 30;

function CardResult({ card, delay }: { card: Card; delay: number }) {
  const ri = RARITY_INFO[card.rarity];
  return (
    <div
      style={{
        width: 90,
        background: `linear-gradient(160deg, ${card.color}30, ${card.color}10)`,
        border: `2px solid ${card.color}`,
        borderRadius: 16,
        padding: "10px 6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: `0 0 18px ${card.color}55`,
        animation: `popIn 0.4s ease-out ${delay}s both`,
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 34 }}>{card.emoji}</div>
      <div style={{ color: "white", fontSize: 12, fontWeight: "bold", textAlign: "center", marginTop: 4 }}>{card.name}</div>
      <div
        style={{
          color: ri.color,
          fontSize: 10,
          fontWeight: "bold",
          marginTop: 2,
          padding: "1px 6px",
          background: `${ri.color}22`,
          borderRadius: 99,
          border: `1px solid ${ri.color}66`,
        }}
      >
        {ri.label}
      </div>
      <div style={{ color: card.color, fontWeight: "bold", fontSize: 18, marginTop: 4 }}>
        {card.value}{card.value2 ? `+${card.value2}` : ""}
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textAlign: "center", marginTop: 2 }}>{card.desc}</div>
    </div>
  );
}

export default function GachaPage({ coins, freeLeft, onDraw, onBack }: Props) {
  const [results, setResults] = useState<Card[]>([]);
  const [animating, setAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const doPull = useCallback(
    (free: boolean) => {
      if (animating) return;
      if (!free && coins < PULL_COST) return;
      setAnimating(true);
      setShowResults(false);
      setResults([]);

      const cards = rollThree();
      onDraw(cards, free);

      setTimeout(() => {
        setResults(cards);
        setShowResults(true);
        setAnimating(false);
      }, 800);
    },
    [animating, coins, onDraw]
  );

  const canPay = coins >= PULL_COST;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #1a0533 100%)",
        display: "flex",
        flexDirection: "column",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        overflowY: "auto",
        paddingBottom: 28,
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 99, padding: "6px 14px", color: "white", fontSize: 14, cursor: "pointer" }}
        >
          ← 뒤로
        </button>
        <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#c084fc", textShadow: "0 0 16px #c084fc" }}>
          🎲 카드 뽑기
        </h2>
        <div style={{ marginLeft: "auto", color: "#facc15", fontWeight: "bold", fontSize: 14 }}>💰 {coins}</div>
      </div>

      {/* Rates */}
      <div style={{ margin: "14px 16px 0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 14px" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>뽑기 확률 (매 뽑기 3장 지급)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {(["common","uncommon","rare","endangered","mythic"] as const).map(r => {
            const info = RARITY_INFO[r];
            const pct = (info.chance * 100).toFixed(0);
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 60, color: info.color, fontSize: 12, fontWeight: "bold" }}>{info.label}</div>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: info.color, borderRadius: 99 }} />
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, width: 36, textAlign: "right" }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pull Buttons */}
      <div style={{ display: "flex", gap: 10, padding: "14px 16px 0" }}>
        {freeLeft > 0 && (
          <button
            onClick={() => doPull(true)}
            disabled={animating}
            style={{
              flex: 1, padding: "16px 0",
              background: "linear-gradient(135deg, #16a34a, #166534)",
              border: "2px solid #4ade80",
              borderRadius: 14, color: "white",
              fontSize: 15, fontWeight: "bold",
              cursor: animating ? "default" : "pointer",
              opacity: animating ? 0.6 : 1,
              boxShadow: "0 0 20px rgba(74,222,128,0.3)",
            }}
          >
            무료 뽑기<br />
            <span style={{ fontSize: 13, color: "#4ade80" }}>잔여 {freeLeft}회</span>
          </button>
        )}
        <button
          onClick={() => doPull(false)}
          disabled={animating || !canPay}
          style={{
            flex: 1, padding: "16px 0",
            background: canPay && !animating
              ? "linear-gradient(135deg, #7c3aed, #4c1d95)"
              : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: 14, color: "white",
            fontSize: 15, fontWeight: "bold",
            cursor: (animating || !canPay) ? "default" : "pointer",
            opacity: (animating || !canPay) ? 0.5 : 1,
            boxShadow: canPay && !animating ? "0 0 20px rgba(124,58,237,0.4)" : "none",
          }}
        >
          뽑기 (3장)<br />
          <span style={{ fontSize: 13, color: "#facc15" }}>💰 {PULL_COST}</span>
        </button>
      </div>

      {/* Animating */}
      {animating && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 40 }}>
          <div style={{ fontSize: 64, animation: "spin 0.5s linear infinite" }}>🎲</div>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>카드를 뽑는 중...</p>
        </div>
      )}

      {/* Results */}
      {showResults && results.length > 0 && (
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12, textAlign: "center" }}>
            ✨ {results.length}장 획득!
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {results.map((c, i) => (
              <CardResult key={c.uid} card={c} delay={i * 0.12} />
            ))}
          </div>
          <button
            onClick={() => { setShowResults(false); setResults([]); }}
            style={{
              marginTop: 20, width: "100%", padding: "13px 0",
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              border: "none", borderRadius: 14, color: "white",
              fontSize: 15, fontWeight: "bold", cursor: "pointer",
            }}
          >
            한번 더 뽑기
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes popIn { from{transform:scale(0.3) rotate(-10deg);opacity:0} to{transform:scale(1) rotate(0deg);opacity:1} }
      `}</style>
    </div>
  );
}
