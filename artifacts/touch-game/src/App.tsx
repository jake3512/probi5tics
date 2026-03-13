import { useState, useCallback } from "react";
import type { Card, GameState, Page } from "./types";
import { STARTER_CARDS } from "./gameData";
import LobbyPage from "./pages/LobbyPage";
import GachaPage from "./pages/GachaPage";
import BattlePage from "./pages/BattlePage";

function loadState(): GameState {
  try {
    const raw = localStorage.getItem("cardgame_state");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    coins: 50,
    collection: STARTER_CARDS,
    deckUids: STARTER_CARDS.slice(0, 6).map((c) => c.uid),
  };
}

function saveState(s: GameState) {
  localStorage.setItem("cardgame_state", JSON.stringify(s));
}

export default function App() {
  const [page, setPage] = useState<Page>("lobby");
  const [gameState, setGameState] = useState<GameState>(loadState);

  const updateState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const handleToggleDeck = useCallback(
    (uid: string) => {
      updateState((prev) => {
        const inDeck = prev.deckUids.includes(uid);
        if (inDeck) {
          return { ...prev, deckUids: prev.deckUids.filter((id) => id !== uid) };
        }
        if (prev.deckUids.length >= 8) return prev;
        return { ...prev, deckUids: [...prev.deckUids, uid] };
      });
    },
    [updateState]
  );

  const handleGachaDraw = useCallback(
    (cards: Card[]) => {
      const cost = cards.length === 1 ? 10 : 80;
      updateState((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - cost),
        collection: [...prev.collection, ...cards],
      }));
    },
    [updateState]
  );

  const handleBattleBack = useCallback(
    (coinsEarned: number) => {
      updateState((prev) => ({ ...prev, coins: prev.coins + coinsEarned }));
      setPage("lobby");
    },
    [updateState]
  );

  const deckCards = gameState.deckUids
    .map((uid) => gameState.collection.find((c) => c.uid === uid))
    .filter(Boolean) as Card[];

  if (page === "gacha") {
    return (
      <GachaPage
        coins={gameState.coins}
        onDraw={handleGachaDraw}
        onBack={() => setPage("lobby")}
      />
    );
  }

  if (page === "battle" && deckCards.length === 8) {
    return (
      <BattlePage
        deckCards={deckCards}
        onBack={handleBattleBack}
      />
    );
  }

  return (
    <LobbyPage
      state={gameState}
      onNavigate={setPage}
      onToggleDeck={handleToggleDeck}
    />
  );
}
