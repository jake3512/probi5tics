import { useState, useCallback, useEffect, useRef } from "react";

type CardType = "attack" | "magic" | "heal" | "shield" | "critical";

interface Card {
  id: number;
  type: CardType;
  value: number;
  name: string;
  emoji: string;
  color: string;
  desc: string;
}

interface BattleLog {
  id: number;
  text: string;
  color: string;
}

let nextId = 0;

const CARD_POOL: Omit<Card, "id" | "value">[] = [
  { type: "attack", name: "검격", emoji: "⚔️", color: "#ef4444", desc: "적에게 데미지" },
  { type: "attack", name: "화살", emoji: "🏹", color: "#f97316", desc: "적에게 데미지" },
  { type: "magic", name: "파이어볼", emoji: "🔥", color: "#f59e0b", desc: "강한 마법 공격" },
  { type: "magic", name: "번개", emoji: "⚡", color: "#eab308", desc: "강한 마법 공격" },
  { type: "heal", name: "치유", emoji: "💚", color: "#22c55e", desc: "HP 회복" },
  { type: "heal", name: "포션", emoji: "🧪", color: "#10b981", desc: "HP 회복" },
  { type: "shield", name: "방패", emoji: "🛡️", color: "#3b82f6", desc: "다음 공격 방어" },
  { type: "shield", name: "결계", emoji: "💎", color: "#6366f1", desc: "다음 공격 방어" },
  { type: "critical", name: "필살기", emoji: "💥", color: "#ec4899", desc: "막대한 데미지!" },
];

const ENEMIES = [
  { name: "드래곤", emoji: "🐉", hp: 30, atk: [4, 7], reward: 3 },
  { name: "마왕", emoji: "👿", hp: 40, atk: [5, 9], reward: 5 },
  { name: "트롤", emoji: "👹", hp: 25, atk: [3, 6], reward: 2 },
  { name: "골렘", emoji: "🪨", hp: 35, atk: [4, 8], reward: 4 },
  { name: "뱀파이어", emoji: "🧛", hp: 28, atk: [5, 8], reward: 4 },
];

function makeCard(): Card {
  const pool = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
  let value = 0;
  if (pool.type === "attack") value = 3 + Math.floor(Math.random() * 6);
  else if (pool.type === "magic") value = 5 + Math.floor(Math.random() * 8);
  else if (pool.type === "heal") value = 4 + Math.floor(Math.random() * 6);
  else if (pool.type === "shield") value = 4 + Math.floor(Math.random() * 5);
  else if (pool.type === "critical") value = 12 + Math.floor(Math.random() * 10);
  return { ...pool, id: nextId++, value };
}

type Phase = "title" | "draw" | "hand" | "enemy_turn" | "win" | "lose" | "stage_clear";

export default function Game() {
  const [phase, setPhase] = useState<Phase>("title");
  const [playerHp, setPlayerHp] = useState(30);
  const [enemyIdx, setEnemyIdx] = useState(0);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].hp);
  const [hand, setHand] = useState<Card[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [shield, setShield] = useState(0);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState<"player" | "enemy" | null>(null);
  const [floatingText, setFloatingText] = useState<{ text: string; color: string; key: number } | null>(null);

  const enemy = ENEMIES[enemyIdx % ENEMIES.length];

  const addLog = useCallback((text: string, color: string) => {
    setLogs((prev) => [{ id: nextId++, text, color }, ...prev].slice(0, 6));
  }, []);

  const showFloat = useCallback((text: string, color: string) => {
    setFloatingText({ text, color, key: nextId++ });
    setTimeout(() => setFloatingText(null), 900);
  }, []);

  const startGame = () => {
    setPlayerHp(30);
    setEnemyIdx(0);
    setEnemyHp(ENEMIES[0].hp);
    setHand([]);
    setShield(0);
    setLogs([]);
    setScore(0);
    setPhase("draw");
    addLog("전투 시작!", "#facc15");
  };

  const drawCard = useCallback(() => {
    if (drawing || hand.length >= 3) return;
    setDrawing(true);
    const card = makeCard();
    setDrawnCard(card);
    setTimeout(() => {
      setDrawnCard(null);
      setHand((prev) => [...prev, card]);
      setDrawing(false);
      if (hand.length + 1 >= 3) {
        setPhase("hand");
      }
    }, 700);
  }, [drawing, hand.length]);

  const playCard = useCallback(
    (card: Card) => {
      if (phase !== "hand") return;
      setHand((prev) => prev.filter((c) => c.id !== card.id));

      let newEnemyHp = enemyHp;
      let newShield = shield;

      if (card.type === "attack" || card.type === "magic" || card.type === "critical") {
        newEnemyHp = Math.max(0, enemyHp - card.value);
        setEnemyHp(newEnemyHp);
        setShake("enemy");
        showFloat(`-${card.value}`, "#ef4444");
        addLog(`${card.emoji} ${card.name} → 적에게 ${card.value} 데미지!`, "#fca5a5");
        setTimeout(() => setShake(null), 400);
      } else if (card.type === "heal") {
        const healed = Math.min(card.value, 30 - playerHp);
        setPlayerHp((p) => Math.min(30, p + card.value));
        showFloat(`+${healed} HP`, "#4ade80");
        addLog(`${card.emoji} ${card.name} → HP ${healed} 회복!`, "#86efac");
      } else if (card.type === "shield") {
        newShield = shield + card.value;
        setShield(newShield);
        showFloat(`🛡️ +${card.value}`, "#93c5fd");
        addLog(`${card.emoji} ${card.name} → 방어력 ${card.value} 획득!`, "#93c5fd");
      }

      if (newEnemyHp <= 0) {
        const bonus = enemy.reward;
        setScore((s) => s + bonus);
        setTimeout(() => setPhase("stage_clear"), 500);
        return;
      }

      setPhase("enemy_turn");
    },
    [phase, enemyHp, shield, playerHp, enemy, addLog, showFloat]
  );

  useEffect(() => {
    if (phase !== "enemy_turn") return;
    const timer = setTimeout(() => {
      const atk = enemy.atk[0] + Math.floor(Math.random() * (enemy.atk[1] - enemy.atk[0] + 1));
      const absorbed = Math.min(shield, atk);
      const dmg = Math.max(0, atk - absorbed);
      const remaining = Math.max(0, shield - atk);
      setShield(remaining);

      if (absorbed > 0) {
        addLog(`${enemy.emoji} 공격 ${atk} → 방어 ${absorbed}, 피해 ${dmg}`, "#a5b4fc");
      } else {
        addLog(`${enemy.emoji} 공격! → 플레이어 ${dmg} 데미지`, "#fca5a5");
      }

      setPlayerHp((p) => {
        const next = Math.max(0, p - dmg);
        if (dmg > 0) {
          setShake("player");
          showFloat(`-${dmg}`, "#f87171");
          setTimeout(() => setShake(null), 400);
        }
        if (next <= 0) {
          setTimeout(() => setPhase("lose"), 300);
        } else {
          setTimeout(() => {
            setHand([]);
            setPhase("draw");
          }, 600);
        }
        return next;
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const nextStage = () => {
    const next = enemyIdx + 1;
    const nextEnemy = ENEMIES[next % ENEMIES.length];
    setEnemyIdx(next);
    setEnemyHp(nextEnemy.hp);
    setHand([]);
    setShield(0);
    addLog(`⚠️ ${nextEnemy.name} 등장!`, "#facc15");
    setPhase("draw");
  };

  const hpBarColor = (hp: number, max: number) => {
    const pct = hp / max;
    if (pct > 0.5) return "#22c55e";
    if (pct > 0.25) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a0533 0%, #0d1b4b 50%, #0a0a1a 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        touchAction: "manipulation",
        userSelect: "none",
      }}
    >
      {/* TITLE */}
      {phase === "title" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
          <div style={{ fontSize: 72 }}>🃏</div>
          <h1 style={{ color: "#facc15", fontSize: 36, fontWeight: "bold", textShadow: "0 0 20px #facc15" }}>
            카드 배틀
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.7 }}>
            카드를 뽑아 몬스터를 물리치세요!<br />
            ⚔️ 공격 · 🔥 마법 · 💚 회복 · 🛡️ 방어 · 💥 필살기
          </p>
          <button
            onClick={startGame}
            style={{
              marginTop: 16,
              padding: "14px 40px",
              background: "linear-gradient(135deg, #facc15, #f97316)",
              color: "#1a0533",
              fontSize: 20,
              fontWeight: "bold",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(250,204,21,0.5)",
            }}
          >
            게임 시작!
          </button>
        </div>
      )}

      {/* GAME */}
      {(phase === "draw" || phase === "hand" || phase === "enemy_turn") && (
        <>
          {/* Header */}
          <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#facc15", fontWeight: "bold", fontSize: 16 }}>⭐ {score}점</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>스테이지 {enemyIdx + 1}</span>
          </div>

          {/* Enemy */}
          <div style={{ padding: "10px 20px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.1)",
                transform: shake === "enemy" ? "translateX(-8px)" : "none",
                transition: "transform 0.1s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 36 }}>{enemy.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{enemy.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    HP {enemyHp} / {enemy.hp}
                  </div>
                </div>
                {phase === "enemy_turn" && (
                  <span style={{ color: "#ef4444", fontSize: 13, fontWeight: "bold", animation: "pulse 0.5s infinite" }}>
                    공격 중...
                  </span>
                )}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(enemyHp / enemy.hp) * 100}%`,
                    background: hpBarColor(enemyHp, enemy.hp),
                    borderRadius: 99,
                    transition: "width 0.4s, background 0.4s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div style={{ padding: "0 20px", flex: "0 0 auto", maxHeight: 90, overflow: "hidden" }}>
            {logs.slice(0, 3).map((log, i) => (
              <div
                key={log.id}
                style={{
                  color: log.color,
                  fontSize: 12,
                  opacity: 1 - i * 0.3,
                  marginBottom: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {log.text}
              </div>
            ))}
          </div>

          {/* Draw Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {/* Float text */}
            {floatingText && (
              <div
                key={floatingText.key}
                style={{
                  position: "absolute",
                  top: "20%",
                  fontSize: 32,
                  fontWeight: "bold",
                  color: floatingText.color,
                  textShadow: `0 0 20px ${floatingText.color}`,
                  animation: "floatUp 0.9s ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                {floatingText.text}
              </div>
            )}

            {phase === "draw" && (
              <>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 16, fontSize: 14 }}>
                  카드를 뽑으세요 ({hand.length}/3)
                </p>
                <div
                  onClick={drawCard}
                  style={{
                    width: 100,
                    height: 140,
                    background: "linear-gradient(135deg, #4c1d95, #1e40af)",
                    borderRadius: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 0 30px rgba(99,102,241,0.5)",
                    transform: drawing ? "scale(0.95)" : "scale(1)",
                    transition: "transform 0.1s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {drawing && drawnCard ? (
                    <>
                      <div style={{ fontSize: 40 }}>{drawnCard.emoji}</div>
                      <div style={{ color: "white", fontWeight: "bold", fontSize: 13, marginTop: 4 }}>{drawnCard.name}</div>
                      <div style={{ color: "#facc15", fontWeight: "bold", fontSize: 18 }}>{drawnCard.value}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 36 }}>🃏</div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 }}>탭!</div>
                    </>
                  )}
                </div>
              </>
            )}

            {phase === "hand" && (
              <p style={{ color: "#facc15", fontSize: 14, marginBottom: 8 }}>카드를 선택하세요!</p>
            )}
            {phase === "enemy_turn" && (
              <div style={{ fontSize: 48 }}>⏳</div>
            )}
          </div>

          {/* Hand */}
          <div
            style={{
              padding: "8px 12px 20px",
              display: "flex",
              gap: 8,
              justifyContent: "center",
              minHeight: 160,
            }}
          >
            {hand.map((card, i) => (
              <div
                key={card.id}
                onClick={() => playCard(card)}
                style={{
                  width: 90,
                  minHeight: 130,
                  background: `linear-gradient(135deg, ${card.color}33, ${card.color}11)`,
                  borderRadius: 14,
                  border: `2px solid ${card.color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: phase === "hand" ? "pointer" : "default",
                  boxShadow: phase === "hand" ? `0 0 20px ${card.color}55` : "none",
                  transform: phase === "hand" ? "translateY(-4px)" : "none",
                  transition: "transform 0.2s",
                  padding: "8px 4px",
                  flex: "0 0 auto",
                }}
              >
                <div style={{ fontSize: 32 }}>{card.emoji}</div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: 12, marginTop: 4, textAlign: "center" }}>
                  {card.name}
                </div>
                <div style={{ color: card.color, fontWeight: "bold", fontSize: 22 }}>{card.value}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textAlign: "center" }}>{card.desc}</div>
              </div>
            ))}
            {hand.length === 0 && phase !== "draw" && (
              <div style={{ color: "rgba(255,255,255,0.3)", alignSelf: "center", fontSize: 13 }}>카드 없음</div>
            )}
          </div>

          {/* Player HP */}
          <div
            style={{
              margin: "0 20px 16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 14,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.1)",
              transform: shake === "player" ? "translateX(8px)" : "none",
              transition: "transform 0.1s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "white", fontWeight: "bold" }}>🧙 플레이어</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                HP {playerHp}/30 {shield > 0 && `🛡️ ${shield}`}
              </span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 99, height: 10, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(playerHp / 30) * 100}%`,
                  background: hpBarColor(playerHp, 30),
                  borderRadius: 99,
                  transition: "width 0.4s",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* STAGE CLEAR */}
      {phase === "stage_clear" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
          <div style={{ fontSize: 64 }}>🎉</div>
          <h2 style={{ color: "#facc15", fontSize: 28, fontWeight: "bold" }}>스테이지 클리어!</h2>
          <p style={{ color: "#4ade80", fontSize: 18, fontWeight: "bold" }}>
            +{enemy.reward}점 획득! (총 {score}점)
          </p>
          <button
            onClick={nextStage}
            style={{
              padding: "14px 40px",
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#052e16",
              fontSize: 18,
              fontWeight: "bold",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(74,222,128,0.4)",
            }}
          >
            다음 스테이지 →
          </button>
        </div>
      )}

      {/* WIN / LOSE */}
      {phase === "lose" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
          <div style={{ fontSize: 64 }}>💀</div>
          <h2 style={{ color: "#ef4444", fontSize: 32, fontWeight: "bold" }}>패배...</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>최종 점수: {score}점</p>
          <button
            onClick={startGame}
            style={{
              padding: "14px 40px",
              background: "linear-gradient(135deg, #facc15, #f97316)",
              color: "#1a0533",
              fontSize: 18,
              fontWeight: "bold",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(250,204,21,0.4)",
            }}
          >
            다시 도전!
          </button>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1.2); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}
