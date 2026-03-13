import { useState, useEffect, useCallback, useRef } from "react";
import type { Card } from "../types";
import { ENEMIES, shuffle } from "../gameData";

interface Props {
  deckCards: Card[];
  onBack: (coinsEarned: number) => void;
}

type BattlePhase = "player" | "enemy" | "win" | "lose";

interface LogEntry {
  id: number;
  text: string;
  color: string;
}

let logId = 0;

export default function BattlePage({ deckCards, onBack }: Props) {
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].hp);
  const [playerHp, setPlayerHp] = useState(30);
  const [shield, setShield] = useState(0);
  const [skipEnemyTurn, setSkipEnemyTurn] = useState(false);

  // Deck & Hand
  const [deckPile, setDeckPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [usedPile, setUsedPile] = useState<Card[]>([]);

  const [phase, setPhase] = useState<BattlePhase>("player");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [shakeTarget, setShakeTarget] = useState<"player" | "enemy" | null>(null);
  const [floats, setFloats] = useState<{ id: number; text: string; color: string; side: "left" | "right" }[]>([]);
  const stageRef = useRef(0);

  const enemy = ENEMIES[enemyIdx % ENEMIES.length];

  const addLog = useCallback((text: string, color: string) => {
    setLogs((prev) => [{ id: logId++, text, color }, ...prev].slice(0, 5));
  }, []);

  const showFloat = useCallback((text: string, color: string, side: "left" | "right") => {
    const id = logId++;
    setFloats((prev) => [...prev, { id, text, color, side }]);
    setTimeout(() => setFloats((p) => p.filter((f) => f.id !== id)), 900);
  }, []);

  const triggerShake = (target: "player" | "enemy") => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 350);
  };

  // Init battle
  useEffect(() => {
    const shuffled = shuffle(deckCards);
    const startHand = shuffled.slice(0, 3);
    const remaining = shuffled.slice(3);
    setHand(startHand);
    setDeckPile(remaining);
    setUsedPile([]);
    addLog("전투 시작! 카드를 사용하세요.", "#facc15");
  }, []);

  const drawCard = useCallback(() => {
    setDeckPile((prev) => {
      if (prev.length === 0) return prev;
      const [top, ...rest] = prev;
      setHand((h) => [...h, top]);
      return rest;
    });
  }, []);

  const reshuffleIfNeeded = useCallback(
    (currentDeck: Card[], currentUsed: Card[]) => {
      if (currentDeck.length === 0 && currentUsed.length > 0) {
        const reshuffled = shuffle(currentUsed);
        addLog("덱 재셔플!", "#a5b4fc");
        return { newDeck: reshuffled, newUsed: [] };
      }
      return { newDeck: currentDeck, newUsed: currentUsed };
    },
    [addLog]
  );

  const playCard = useCallback(
    (card: Card) => {
      if (phase !== "player") return;
      setHand((prev) => prev.filter((c) => c.uid !== card.uid));
      setUsedPile((prev) => [...prev, card]);

      let newEnemyHp = -1;

      if (card.type === "attack" || card.type === "magic") {
        setEnemyHp((hp) => {
          const next = Math.max(0, hp - card.value);
          newEnemyHp = next;
          return next;
        });
        showFloat(`-${card.value}`, "#ef4444", "right");
        triggerShake("enemy");
        addLog(`${card.emoji} ${card.name} → 적에게 ${card.value} 데미지!`, "#fca5a5");
      } else if (card.type === "heal") {
        setPlayerHp((hp) => Math.min(30, hp + card.value));
        showFloat(`+${card.value}HP`, "#4ade80", "left");
        addLog(`${card.emoji} ${card.name} → HP ${card.value} 회복!`, "#86efac");
      } else if (card.type === "shield") {
        setShield((s) => s + card.value);
        showFloat(`🛡️+${card.value}`, "#93c5fd", "left");
        addLog(`${card.emoji} ${card.name} → 방어 ${card.value} 획득!`, "#93c5fd");
      } else if (card.type === "special") {
        if (card.defId === "finisher" || card.defId === "dragon") {
          setEnemyHp((hp) => {
            const next = Math.max(0, hp - card.value);
            newEnemyHp = next;
            return next;
          });
          showFloat(`-${card.value}!!`, "#ec4899", "right");
          triggerShake("enemy");
          addLog(`${card.emoji} ${card.name} → 적에게 ${card.value} 데미지!`, "#f9a8d4");
        } else if (card.defId === "revive") {
          setPlayerHp((hp) => Math.min(30, hp + card.value));
          showFloat(`+${card.value}HP`, "#fde68a", "left");
          addLog(`${card.emoji} ${card.name} → HP ${card.value} 회복!`, "#fde68a");
        } else if (card.defId === "timestop") {
          setSkipEnemyTurn(true);
          showFloat("시간 정지!", "#a855f7", "right");
          addLog(`${card.emoji} ${card.name} → 적 행동 무효화!`, "#d8b4fe");
        }
      }

      // Draw 1 after playing
      setTimeout(() => {
        setDeckPile((deck) => {
          setUsedPile((used) => {
            const { newDeck, newUsed } = reshuffleIfNeeded(deck, used.concat(card));
            if (newDeck.length > 0) {
              const [top, ...rest] = newDeck;
              setHand((h) => [...h, top]);
              setDeckPile(rest);
              setUsedPile(newUsed);
            } else {
              setDeckPile(newDeck);
              setUsedPile(newUsed);
            }
            return newUsed;
          });
          return deck;
        });
      }, 200);

      // Check enemy dead
      setTimeout(() => {
        setEnemyHp((hp) => {
          if (hp <= 0) {
            const reward = enemy.reward;
            setCoinsEarned((c) => c + reward);
            addLog(`🎉 ${enemy.name} 처치! +${reward}코인`, "#4ade80");
            setPhase("win");
            stageRef.current += 1;
          } else {
            setPhase("enemy");
          }
          return hp;
        });
      }, 300);
    },
    [phase, enemy, reshuffleIfNeeded, addLog, showFloat]
  );

  // Enemy turn
  useEffect(() => {
    if (phase !== "enemy") return;
    const timer = setTimeout(() => {
      if (skipEnemyTurn) {
        setSkipEnemyTurn(false);
        setPhase("player");
        return;
      }
      const atk = enemy.atkMin + Math.floor(Math.random() * (enemy.atkMax - enemy.atkMin + 1));
      const absorbed = Math.min(shield, atk);
      const dmg = Math.max(0, atk - absorbed);
      setShield(Math.max(0, shield - atk));

      if (absorbed > 0) {
        addLog(`${enemy.emoji} 공격 ${atk} → 방어 ${absorbed} → 피해 ${dmg}`, "#a5b4fc");
      } else {
        addLog(`${enemy.emoji} 공격! → 플레이어 ${dmg} 데미지`, "#fca5a5");
      }

      if (dmg > 0) {
        showFloat(`-${dmg}`, "#f87171", "left");
        triggerShake("player");
      }

      setPlayerHp((hp) => {
        const next = Math.max(0, hp - dmg);
        if (next <= 0) {
          setPhase("lose");
        } else {
          setPhase("player");
        }
        return next;
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const nextStage = () => {
    const next = enemyIdx + 1;
    setEnemyIdx(next);
    setEnemyHp(ENEMIES[next % ENEMIES.length].hp);
    setShield(0);
    setPhase("player");
    addLog(`⚠️ ${ENEMIES[next % ENEMIES.length].name} 등장!`, "#facc15");
  };

  const hpColor = (hp: number, max: number) => {
    const p = hp / max;
    if (p > 0.5) return "#22c55e";
    if (p > 0.25) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      style={{
        height: "100dvh",
        background: "linear-gradient(180deg, #1a0533 0%, #0d1b4b 50%, #0a0a1a 100%)",
        display: "flex",
        flexDirection: "column",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Floating texts */}
      {floats.map((f) => (
        <div
          key={f.id}
          style={{
            position: "absolute",
            top: "35%",
            left: f.side === "left" ? "15%" : "55%",
            fontSize: 26,
            fontWeight: "bold",
            color: f.color,
            textShadow: `0 0 16px ${f.color}`,
            animation: "floatUp 0.9s ease-out forwards",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {f.text}
        </div>
      ))}

      {/* Top bar */}
      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => onBack(coinsEarned)}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 99, padding: "5px 12px", color: "white", fontSize: 13, cursor: "pointer" }}
        >
          ← 로비
        </button>
        <span style={{ color: "#facc15", fontWeight: "bold", fontSize: 13 }}>💰 +{coinsEarned}</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>스테이지 {stageRef.current + 1}</span>
      </div>

      {/* Enemy */}
      <div
        style={{
          margin: "10px 14px 0",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 14,
          padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.1)",
          transform: shakeTarget === "enemy" ? "translateX(-10px)" : "none",
          transition: "transform 0.1s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 32 }}>{enemy.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: 15 }}>{enemy.name}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>HP {enemyHp}/{enemy.hp}</div>
          </div>
          {phase === "enemy" && (
            <span style={{ color: "#ef4444", fontSize: 12, fontWeight: "bold" }}>공격 중...</span>
          )}
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 8 }}>
          <div style={{ height: "100%", width: `${(enemyHp / enemy.hp) * 100}%`, background: hpColor(enemyHp, enemy.hp), borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Logs */}
      <div style={{ padding: "6px 14px 0", flex: "0 0 auto" }}>
        {logs.slice(0, 2).map((l, i) => (
          <div key={l.id} style={{ color: l.color, fontSize: 11, opacity: 1 - i * 0.4, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.text}</div>
        ))}
      </div>

      {/* Deck info */}
      <div style={{ padding: "4px 14px 0", display: "flex", gap: 12 }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>🃏 덱 {deckPile.length}장</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>♻️ 버린 카드 {usedPile.length}장</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>✋ 손패 {hand.length}장</span>
      </div>

      {/* Hand */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 8px 4px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
          {hand.map((card) => (
            <div
              key={card.uid}
              onClick={() => playCard(card)}
              style={{
                width: 78,
                background: `linear-gradient(135deg, ${card.color}44, ${card.color}18)`,
                border: `2px solid ${card.color}`,
                borderRadius: 14,
                padding: "8px 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: phase === "player" ? "pointer" : "default",
                opacity: phase !== "player" ? 0.5 : 1,
                transform: phase === "player" ? "translateY(-8px)" : "none",
                transition: "transform 0.2s, opacity 0.2s",
                boxShadow: phase === "player" ? `0 0 20px ${card.color}55` : "none",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 28 }}>{card.emoji}</div>
              <div style={{ color: "white", fontSize: 10, fontWeight: "bold", textAlign: "center", marginTop: 2 }}>{card.name}</div>
              <div style={{ color: card.color, fontWeight: "bold", fontSize: 18 }}>{card.value || "★"}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textAlign: "center" }}>{card.desc}</div>
            </div>
          ))}
          {hand.length === 0 && phase === "player" && (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, alignSelf: "center" }}>카드 없음</div>
          )}
        </div>
      </div>

      {/* Player HP */}
      <div
        style={{
          margin: "4px 14px 12px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 14,
          padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.1)",
          transform: shakeTarget === "player" ? "translateX(10px)" : "none",
          transition: "transform 0.1s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontWeight: "bold", fontSize: 14 }}>🧙 나의 HP</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            {playerHp}/30 {shield > 0 && `🛡️${shield}`}
          </span>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 10 }}>
          <div style={{ height: "100%", width: `${(playerHp / 30) * 100}%`, background: hpColor(playerHp, 30), borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Overlays */}
      {phase === "win" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 60 }}>🎉</div>
          <h2 style={{ color: "#facc15", fontSize: 26, fontWeight: "bold" }}>스테이지 클리어!</h2>
          <p style={{ color: "#4ade80" }}>+{enemy.reward}코인 (총 +{coinsEarned}코인)</p>
          <button
            onClick={nextStage}
            style={{ padding: "14px 36px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: 50, color: "white", fontSize: 17, fontWeight: "bold", cursor: "pointer" }}
          >
            다음 스테이지 →
          </button>
          <button
            onClick={() => onBack(coinsEarned)}
            style={{ padding: "10px 28px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 50, color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer" }}
          >
            로비로 돌아가기
          </button>
        </div>
      )}
      {phase === "lose" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 60 }}>💀</div>
          <h2 style={{ color: "#ef4444", fontSize: 26, fontWeight: "bold" }}>패배...</h2>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>획득 코인: +{coinsEarned}</p>
          <button
            onClick={() => onBack(coinsEarned)}
            style={{ padding: "14px 36px", background: "linear-gradient(135deg, #facc15, #f97316)", border: "none", borderRadius: 50, color: "#1a0533", fontSize: 17, fontWeight: "bold", cursor: "pointer" }}
          >
            로비로 돌아가기
          </button>
        </div>
      )}

      <style>{`
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0) scale(1.1)} 100%{opacity:0;transform:translateY(-60px) scale(0.8)} }
      `}</style>
    </div>
  );
}
