import { useEffect, useRef, useState, useCallback } from "react";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
  size: number;
  isBomb: boolean;
}

const FRUITS = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍑", "🍒", "🥝", "🍉", "🍌"];
const BOMBS = ["💣"];

let nextId = 0;

export default function Game() {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("highscore") || 0));
  const [level, setLevel] = useState(1);

  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameStateRef = useRef<"idle" | "playing" | "gameover">("idle");
  const levelRef = useRef(1);

  itemsRef.current = items;
  scoreRef.current = score;
  livesRef.current = lives;
  gameStateRef.current = gameState;
  levelRef.current = level;

  const spawnItem = useCallback(() => {
    const isBomb = Math.random() < 0.15;
    const emoji = isBomb ? BOMBS[0] : FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const speed = 2 + levelRef.current * 0.5 + Math.random() * 2;
    const size = 40 + Math.random() * 20;
    const newItem: FallingItem = {
      id: nextId++,
      x: size / 2 + Math.random() * (window.innerWidth - size),
      y: -size,
      speed,
      emoji,
      size,
      isBomb,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setItems([]);
    setParticles([]);
    setGameState("playing");
    gameStateRef.current = "playing";
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
  }, []);

  useEffect(() => {
    if (gameState !== "playing") {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return;
    }

    const loop = () => {
      if (gameStateRef.current !== "playing") return;

      setItems((prev) => {
        const updated: FallingItem[] = [];
        let missedFruits = 0;
        for (const item of prev) {
          const newY = item.y + item.speed;
          if (newY > window.innerHeight + item.size) {
            if (!item.isBomb) missedFruits++;
          } else {
            updated.push({ ...item, y: newY });
          }
        }
        if (missedFruits > 0) {
          setLives((l) => {
            const next = Math.max(0, l - missedFruits);
            livesRef.current = next;
            if (next <= 0) {
              setGameState("gameover");
              gameStateRef.current = "gameover";
              setHighScore((prev) => {
                const newHigh = Math.max(prev, scoreRef.current);
                localStorage.setItem("highscore", String(newHigh));
                return newHigh;
              });
            }
            return next;
          });
        }
        return updated;
      });

      const newLevel = Math.floor(scoreRef.current / 10) + 1;
      if (newLevel !== levelRef.current) {
        setLevel(newLevel);
        levelRef.current = newLevel;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    const spawnInterval = Math.max(600, 1400 - level * 100);
    spawnTimerRef.current = window.setInterval(() => {
      if (gameStateRef.current === "playing") spawnItem();
    }, spawnInterval);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameState, spawnItem]);

  const handleTap = useCallback((clientX: number, clientY: number) => {
    if (gameStateRef.current !== "playing") return;

    setItems((prev) => {
      let hit = false;
      const remaining: FallingItem[] = [];
      for (const item of prev) {
        if (!hit) {
          const dx = clientX - item.x;
          const dy = clientY - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < item.size) {
            hit = true;
            if (item.isBomb) {
              setLives((l) => {
                const next = Math.max(0, l - 1);
                livesRef.current = next;
                if (next <= 0) {
                  setGameState("gameover");
                  gameStateRef.current = "gameover";
                  setHighScore((prev) => {
                    const newHigh = Math.max(prev, scoreRef.current);
                    localStorage.setItem("highscore", String(newHigh));
                    return newHigh;
                  });
                }
                return next;
              });
              setParticles((p) => [...p, { id: nextId++, x: item.x, y: item.y, emoji: "💥" }]);
            } else {
              setScore((s) => {
                const next = s + 1;
                scoreRef.current = next;
                return next;
              });
              setParticles((p) => [...p, { id: nextId++, x: item.x, y: item.y, emoji: item.emoji }]);
            }
            continue;
          }
        }
        remaining.push(item);
      }
      return remaining;
    });
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((p) => p.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [particles]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      handleTap(e.clientX, e.clientY);
    },
    [handleTap]
  );

  const hearts = Array.from({ length: 3 }, (_, i) => (i < lives ? "❤️" : "🖤"));

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        background: "linear-gradient(180deg, #0f0c29, #302b63, #24243e)",
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
    >
      {gameState === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="text-6xl animate-bounce">🍎</div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">과일 잡기!</h1>
          <p className="text-white/70 text-lg text-center px-8">
            떨어지는 과일을 터치하세요!<br />
            💣 폭탄은 피하세요!
          </p>
          {highScore > 0 && (
            <p className="text-yellow-300 font-semibold">최고 점수: {highScore}</p>
          )}
          <button
            className="mt-4 px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xl font-bold rounded-full shadow-xl active:scale-95 transition-transform"
            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
          >
            게임 시작!
          </button>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="text-6xl">😢</div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">게임 오버</h1>
          <p className="text-2xl text-yellow-300 font-bold">점수: {score}</p>
          {score >= highScore && score > 0 && (
            <p className="text-green-400 font-semibold text-lg">🎉 최고 점수 달성!</p>
          )}
          <p className="text-white/60">최고 점수: {highScore}</p>
          <button
            className="mt-4 px-10 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xl font-bold rounded-full shadow-xl active:scale-95 transition-transform"
            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
          >
            다시 시작!
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4 pb-2 z-10"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }}
          >
            <div className="text-2xl">{hearts.join(" ")}</div>
            <div className="text-white text-xl font-bold">점수: {score}</div>
            <div className="text-white/70 text-sm">Lv.{level}</div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-none"
              style={{
                left: item.x - item.size / 2,
                top: item.y - item.size / 2,
                width: item.size,
                height: item.size,
                fontSize: item.size * 0.8,
                lineHeight: `${item.size}px`,
                textAlign: "center",
                filter: item.isBomb ? "drop-shadow(0 0 8px red)" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            >
              {item.emoji}
            </div>
          ))}

          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none animate-ping"
              style={{
                left: p.x - 20,
                top: p.y - 20,
                width: 40,
                height: 40,
                fontSize: 32,
                lineHeight: "40px",
                textAlign: "center",
              }}
            >
              {p.emoji}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
