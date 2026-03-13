import { useState, useEffect, useCallback, useRef } from "react";
import type { Card } from "../types";
import { ENEMIES, shuffle, RARITY_INFO } from "../gameData";

interface Props {
  deckCards: Card[];
  onBack: (coinsEarned: number) => void;
}

type BattlePhase = "player" | "enemy" | "win" | "lose";

interface LogEntry { id: number; text: string; color: string; }

let logId = 0;

export default function BattlePage({ deckCards, onBack }: Props) {
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].hp);
  const [playerHp, setPlayerHp] = useState(30);
  const [shield, setShield] = useState(0);
  const [skipEnemy, setSkipEnemy] = useState(false);

  const [deckPile, setDeckPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [usedPile, setUsedPile] = useState<Card[]>([]);

  const [phase, setPhase] = useState<BattlePhase>("player");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [shakeTarget, setShakeTarget] = useState<"player" | "enemy" | null>(null);
  const [floats, setFloats] = useState<{ id: number; text: string; color: string; side: "left" | "right" }[]>([]);
  const stageNum = useRef(1);

  const enemy = ENEMIES[enemyIdx % ENEMIES.length];

  const addLog = useCallback((text: string, color: string) =>
    setLogs(prev => [{ id: logId++, text, color }, ...prev].slice(0, 5)), []);

  const showFloat = useCallback((text: string, color: string, side: "left" | "right") => {
    const id = logId++;
    setFloats(prev => [...prev, { id, text, color, side }]);
    setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 900);
  }, []);

  const triggerShake = (target: "player" | "enemy") => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 350);
  };

  // Init
  useEffect(() => {
    const shuffled = shuffle(deckCards);
    setHand(shuffled.slice(0, 3));
    setDeckPile(shuffled.slice(3));
    setUsedPile([]);
    addLog("전투 시작! 카드를 선택하세요.", "#facc15");
  }, []);

  const drawFromDeck = useCallback((currentDeck: Card[], currentUsed: Card[], addCard: (c: Card) => void) => {
    if (currentDeck.length > 0) {
      const [top, ...rest] = currentDeck;
      addCard(top);
      setDeckPile(rest);
    } else if (currentUsed.length > 0) {
      const reshuffled = shuffle(currentUsed);
      addLog("덱 재셔플!", "#a5b4fc");
      const [top, ...rest] = reshuffled;
      addCard(top);
      setDeckPile(rest);
      setUsedPile([]);
    }
  }, [addLog]);

  const playCard = useCallback((card: Card) => {
    if (phase !== "player") return;

    setHand(prev => prev.filter(c => c.uid !== card.uid));
    const ri = RARITY_INFO[card.rarity];

    let killed = false;

    if (card.type === "attack" || card.type === "magic") {
      setEnemyHp(hp => {
        const next = Math.max(0, hp - card.value);
        if (next <= 0) killed = true;
        return next;
      });
      showFloat(`-${card.value}`, "#ef4444", "right");
      triggerShake("enemy");
      addLog(`${card.emoji} ${card.name} [${ri.label}] → ${card.value} 데미지!`, "#fca5a5");
    } else if (card.type === "heal") {
      setPlayerHp(hp => Math.min(30, hp + card.value));
      showFloat(`+${card.value}HP`, "#4ade80", "left");
      addLog(`${card.emoji} ${card.name} [${ri.label}] → HP ${card.value} 회복!`, "#86efac");
    } else if (card.type === "shield") {
      setShield(s => s + card.value);
      showFloat(`🛡️+${card.value}`, "#93c5fd", "left");
      addLog(`${card.emoji} ${card.name} [${ri.label}] → 방어 ${card.value}!`, "#93c5fd");
    } else if (card.type === "special") {
      // Dragon breath (e01): 20 damage
      if (card.defId === "e01") {
        setEnemyHp(hp => { const next = Math.max(0, hp - card.value); if (next <= 0) killed = true; return next; });
        showFloat(`🐉-${card.value}`, "#f97316", "right");
        triggerShake("enemy");
        addLog(`${card.emoji} ${card.name} [${ri.label}] → ${card.value} 불꽃 데미지!`, "#fb923c");
      }
      // Heavenly defense (e02): shield + heal
      else if (card.defId === "e02") {
        setShield(s => s + card.value);
        setPlayerHp(hp => Math.min(30, hp + (card.value2 ?? 0)));
        showFloat(`🛡️+${card.value}`, "#f97316", "left");
        addLog(`${card.emoji} ${card.name} [${ri.label}] → 방어 ${card.value} + HP ${card.value2} 회복!`, "#fdba74");
      }
      // End of World (m01): 25 damage + skip enemy
      else if (card.defId === "m01") {
        setEnemyHp(hp => { const next = Math.max(0, hp - card.value); if (next <= 0) killed = true; return next; });
        setSkipEnemy(true);
        showFloat(`💫-${card.value}!!`, "#ec4899", "right");
        triggerShake("enemy");
        addLog(`${card.emoji} ${card.name} [${ri.label}] → ${card.value} 데미지 + 행동 무효!`, "#f9a8d4");
      }
    }

    // Draw 1 after playing
    setTimeout(() => {
      setDeckPile(deck => {
        setUsedPile(used => {
          drawFromDeck(deck, [...used, card], c => setHand(h => [...h, c]));
          return [...used, card];
        });
        return deck;
      });
    }, 200);

    // Check win after delay
    setTimeout(() => {
      setEnemyHp(hp => {
        if (hp <= 0) {
          const reward = enemy.reward;
          setCoinsEarned(c => c + reward);
          addLog(`🎉 ${enemy.name} 처치! +${reward}코인`, "#4ade80");
          setPhase("win");
        } else {
          setPhase("enemy");
        }
        return hp;
      });
    }, 350);
  }, [phase, enemy, drawFromDeck, addLog, showFloat]);

  // Enemy turn
  useEffect(() => {
    if (phase !== "enemy") return;
    const t = setTimeout(() => {
      if (skipEnemy) {
        setSkipEnemy(false);
        setPhase("player");
        addLog("⏰ 시간 정지! 적 행동 무효", "#d8b4fe");
        return;
      }
      const atk = enemy.atkMin + Math.floor(Math.random() * (enemy.atkMax - enemy.atkMin + 1));
      const absorbed = Math.min(shield, atk);
      const dmg = Math.max(0, atk - absorbed);
      setShield(Math.max(0, shield - atk));
      if (absorbed > 0) addLog(`${enemy.emoji} 공격 ${atk} → 방어 ${absorbed} 흡수, 피해 ${dmg}`, "#a5b4fc");
      else addLog(`${enemy.emoji} 공격! → ${dmg} 데미지`, "#fca5a5");
      if (dmg > 0) { showFloat(`-${dmg}`, "#f87171", "left"); triggerShake("player"); }
      setPlayerHp(hp => {
        const next = Math.max(0, hp - dmg);
        if (next <= 0) setPhase("lose");
        else setPhase("player");
        return next;
      });
    }, 800);
    return () => clearTimeout(t);
  }, [phase, enemy, shield, skipEnemy]);

  const nextStage = () => {
    const next = enemyIdx + 1;
    stageNum.current++;
    setEnemyIdx(next);
    setEnemyHp(ENEMIES[next % ENEMIES.length].hp);
    setShield(0);
    setPhase("player");
    addLog(`⚠️ ${ENEMIES[next % ENEMIES.length].name} 등장!`, "#facc15");
  };

  const hpColor = (hp: number, max: number) => {
    const p = hp / max;
    return p > 0.5 ? "#22c55e" : p > 0.25 ? "#f59e0b" : "#ef4444";
  };

  return (
    <div style={{
      height: "100dvh",
      background: "linear-gradient(180deg, #1a0533 0%, #0d1b4b 50%, #0a0a1a 100%)",
      display: "flex", flexDirection: "column", color: "white",
      fontFamily: "'Segoe UI', sans-serif", overflow: "hidden", position: "relative",
    }}>
      {/* Floats */}
      {floats.map(f => (
        <div key={f.id} style={{
          position: "absolute", top: "35%",
          left: f.side === "left" ? "10%" : "55%",
          fontSize: 24, fontWeight: "bold", color: f.color,
          textShadow: `0 0 16px ${f.color}`,
          animation: "floatUp 0.9s ease-out forwards",
          pointerEvents: "none", zIndex: 20,
        }}>{f.text}</div>
      ))}

      {/* Top bar */}
      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => onBack(coinsEarned)}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 99, padding: "5px 12px", color: "white", fontSize: 13, cursor: "pointer" }}>
          ← 로비
        </button>
        <span style={{ color: "#facc15", fontWeight: "bold", fontSize: 13 }}>💰 +{coinsEarned}</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>스테이지 {stageNum.current}</span>
      </div>

      {/* Enemy */}
      <div style={{
        margin: "10px 14px 0",
        background: "rgba(255,255,255,0.05)", borderRadius: 14,
        padding: "10px 14px", border: "1px solid rgba(255,255,255,0.1)",
        transform: shakeTarget === "enemy" ? "translateX(-10px)" : "none", transition: "transform 0.1s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 32 }}>{enemy.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: 15 }}>{enemy.name}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>HP {enemyHp}/{enemy.hp}</div>
          </div>
          {phase === "enemy" && <span style={{ color: "#ef4444", fontSize: 12, fontWeight: "bold" }}>공격 중...</span>}
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 8 }}>
          <div style={{ height: "100%", width: `${(enemyHp / enemy.hp) * 100}%`, background: hpColor(enemyHp, enemy.hp), borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Logs */}
      <div style={{ padding: "6px 14px 0" }}>
        {logs.slice(0, 2).map((l, i) => (
          <div key={l.id} style={{ color: l.color, fontSize: 11, opacity: 1 - i * 0.45, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.text}</div>
        ))}
      </div>

      {/* Deck status */}
      <div style={{ padding: "4px 14px 0", display: "flex", gap: 14 }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>🃏 덱 {deckPile.length}</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>♻️ 버림 {usedPile.length}</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>✋ 손패 {hand.length}</span>
        {shield > 0 && <span style={{ color: "#93c5fd", fontSize: 11 }}>🛡️ {shield}</span>}
      </div>

      {/* Hand */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 8px 4px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", overflowX: "auto", paddingBottom: 4 }}>
          {hand.map(card => {
            const ri = RARITY_INFO[card.rarity];
            return (
              <div key={card.uid} onClick={() => playCard(card)}
                style={{
                  width: 76, flexShrink: 0,
                  background: `linear-gradient(160deg, ${card.color}44, ${card.color}18)`,
                  border: `2px solid ${card.color}`,
                  borderRadius: 14, padding: "8px 4px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: phase === "player" ? "pointer" : "default",
                  opacity: phase !== "player" ? 0.4 : 1,
                  transform: phase === "player" ? "translateY(-8px)" : "none",
                  transition: "transform 0.2s, opacity 0.2s",
                  boxShadow: phase === "player" ? `0 0 20px ${card.color}55` : "none",
                }}
              >
                <div style={{ fontSize: 26 }}>{card.emoji}</div>
                <div style={{ color: "white", fontSize: 10, fontWeight: "bold", textAlign: "center", marginTop: 2 }}>{card.name}</div>
                <div style={{ color: ri.color, fontSize: 8, marginTop: 1 }}>{ri.label}</div>
                <div style={{ color: card.color, fontWeight: "bold", fontSize: 17 }}>
                  {card.value}{card.value2 ? `+${card.value2}` : ""}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textAlign: "center" }}>{card.desc}</div>
              </div>
            );
          })}
          {hand.length === 0 && phase === "player" && (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, alignSelf: "center" }}>카드 없음</div>
          )}
        </div>
      </div>

      {/* Player HP */}
      <div style={{
        margin: "4px 14px 12px",
        background: "rgba(255,255,255,0.05)", borderRadius: 14,
        padding: "10px 14px", border: "1px solid rgba(255,255,255,0.1)",
        transform: shakeTarget === "player" ? "translateX(10px)" : "none", transition: "transform 0.1s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontWeight: "bold", fontSize: 14 }}>🧙 나의 HP</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{playerHp}/30</span>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 10 }}>
          <div style={{ height: "100%", width: `${(playerHp / 30) * 100}%`, background: hpColor(playerHp, 30), borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Win Overlay */}
      {phase === "win" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <h2 style={{ color: "#facc15", fontSize: 24, fontWeight: "bold" }}>스테이지 클리어!</h2>
          <p style={{ color: "#4ade80" }}>+{enemy.reward}코인 획득 (총 +{coinsEarned})</p>
          <button onClick={nextStage}
            style={{ padding: "13px 32px", background: "linear-gradient(135deg, #22c55e,#16a34a)", border: "none", borderRadius: 50, color: "white", fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
            다음 스테이지 →
          </button>
          <button onClick={() => onBack(coinsEarned)}
            style={{ padding: "9px 24px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 50, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
            로비로 돌아가기
          </button>
        </div>
      )}

      {/* Lose Overlay */}
      {phase === "lose" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ fontSize: 56 }}>💀</div>
          <h2 style={{ color: "#ef4444", fontSize: 24, fontWeight: "bold" }}>패배...</h2>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>획득 코인: +{coinsEarned}</p>
          <button onClick={() => onBack(coinsEarned)}
            style={{ padding: "13px 32px", background: "linear-gradient(135deg, #facc15,#f97316)", border: "none", borderRadius: 50, color: "#1a0533", fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
            로비로 돌아가기
          </button>
        </div>
      )}

      <style>{`@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1.1)}100%{opacity:0;transform:translateY(-60px) scale(0.8)}}`}</style>
    </div>
  );
}
