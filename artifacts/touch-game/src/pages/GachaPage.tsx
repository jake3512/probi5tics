import { useState, useCallback } from "react";
import type { Card } from "../types";
import { rollCard, RARITY_LABEL } from "../gameData";

interface Props {
  coins: number;
  onDraw: (cards: Card[]) => void;
  onBack: () => void;
}

const SINGLE_COST = 10;
const MULTI_COST = 80;

function CardResult({ card }: { card: Card }) {
  const rl = RARITY_LABEL[card.rarity];
  return (
    <div
      style={{
        width: 80,
        background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)`,
        border: `2px solid ${card.color}`,
        borderRadius: 14,
        padding: "8px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: `0 0 16px ${card.color}44`,
        animation: "popIn 0.3s ease-out",
      }}
    >
      <div style={{ fontSize: 28 }}>{card.emoji}</div>
      <div style={{ color: "white", fontSize: 11, fontWeight: "bold", textAlign: "center", marginTop: 3 }}>{card.name}</div>
      <div style={{ color: rl.color, fontSize: 10, marginTop: 1 }}>{rl.label}</div>
      <div style={{ color: card.color, fontWeight: "bold", fontSize: 16, marginTop: 2 }}>{card.value}</div>
    </div>
  );
}

export default function GachaPage({ coins, onDraw, onBack }: Props) {
  const [results, setResults] = useState<Card[]>([]);
  const [rolling, setRolling] = useState(false);
  const [step, setStep] = useState<"idle" | "rolling" | "result">("idle");

  const doGacha = useCallback(
    (count: number) => {
      const cost = count === 1 ? SINGLE_COST : MULTI_COST;
      if (coins < cost) return;
      setRolling(true);
      setStep("rolling");
      setResults([]);

      // Reveal cards one by one with delay
      const cards = Array.from({ length: count }, () => rollCard());
      let i = 0;
      const reveal = () => {
        if (i < cards.length) {
          setResults((prev) => [...prev, cards[i]]);
          i++;
          setTimeout(reveal, count === 1 ? 0 : 120);
        } else {
          setRolling(false);
          setStep("result");
        }
      };
      setTimeout(reveal, count === 1 ? 400 : 600);
      onDraw(cards);
    },
    [coins, onDraw]
  );

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

      {/* Rates Info */}
      <div style={{ margin: "14px 16px 0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>뽑기 확률</div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>⬜ 일반 70%</span>
          <span style={{ fontSize: 12, color: "#60a5fa" }}>🟦 레어 25%</span>
          <span style={{ fontSize: 12, color: "#c084fc" }}>🟪 에픽 5%</span>
        </div>
      </div>

      {/* Gacha Buttons */}
      <div style={{ display: "flex", gap: 10, padding: "14px 16px 0" }}>
        <button
          onClick={() => doGacha(1)}
          disabled={rolling || coins < SINGLE_COST}
          style={{
            flex: 1, padding: "16px 0",
            background: coins >= SINGLE_COST && !rolling
              ? "linear-gradient(135deg, #7c3aed, #4c1d95)"
              : "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 14, color: "white",
            fontSize: 15, fontWeight: "bold", cursor: rolling || coins < SINGLE_COST ? "default" : "pointer",
            opacity: rolling || coins < SINGLE_COST ? 0.5 : 1,
          }}
        >
          1장 뽑기<br />
          <span style={{ fontSize: 13, color: "#facc15" }}>💰 {SINGLE_COST}</span>
        </button>
        <button
          onClick={() => doGacha(10)}
          disabled={rolling || coins < MULTI_COST}
          style={{
            flex: 1, padding: "16px 0",
            background: coins >= MULTI_COST && !rolling
              ? "linear-gradient(135deg, #db2777, #9d174d)"
              : "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 14, color: "white",
            fontSize: 15, fontWeight: "bold", cursor: rolling || coins < MULTI_COST ? "default" : "pointer",
            opacity: rolling || coins < MULTI_COST ? 0.5 : 1,
          }}
        >
          10장 뽑기<br />
          <span style={{ fontSize: 13, color: "#facc15" }}>💰 {MULTI_COST}</span>
        </button>
      </div>

      {/* Rolling Animation */}
      {step === "rolling" && results.length === 0 && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, animation: "spin 0.6s linear infinite" }}>🎲</div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>뽑는 중...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ margin: "16px 16px 0" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
            결과 — {results.length}장 획득!
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {results.map((c, i) => (
              <div key={i} style={{ animation: `popIn 0.3s ease-out ${i * 0.05}s both` }}>
                <CardResult card={c} />
              </div>
            ))}
          </div>
          {!rolling && (
            <button
              onClick={() => { setStep("idle"); setResults([]); }}
              style={{
                marginTop: 16, width: "100%", padding: "13px 0",
                background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
                border: "none", borderRadius: 14, color: "white",
                fontSize: 15, fontWeight: "bold", cursor: "pointer",
              }}
            >
              한번 더 뽑기
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
