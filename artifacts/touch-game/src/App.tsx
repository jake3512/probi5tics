import { useState, useCallback } from "react";
import type { Card, GameState, Page } from "./types";
import LobbyPage from "./pages/LobbyPage";
import GachaPage from "./pages/GachaPage";
import BattlePage from "./pages/BattlePage";

function loadState(): GameState {
  try {
    const raw = localStorage.getItem("cardgame_v2");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { coins: 0, freeGachaLeft: 3, collection: [], deckUids: [] };
}

function saveState(s: GameState) {
  localStorage.setItem("cardgame_v2", JSON.stringify(s));
}

export default function App() {
  const [page, setPage] = useState<Page>("lobby");
  const [gs, setGs] = useState<GameState>(loadState);

  const update = useCallback((fn: (prev: GameState) => GameState) => {
    setGs(prev => { const next = fn(prev); saveState(next); return next; });
  }, []);

  const handleToggleDeck = useCallback((uid: string) => {
    update(prev => {
      if (prev.deckUids.includes(uid))
        return { ...prev, deckUids: prev.deckUids.filter(id => id !== uid) };
      if (prev.deckUids.length >= 8) return prev;
      return { ...prev, deckUids: [...prev.deckUids, uid] };
    });
  }, [update]);

  const handleGachaDraw = useCallback((cards: Card[], usedFree: boolean) => {
    update(prev => ({
      ...prev,
      coins: usedFree ? prev.coins : Math.max(0, prev.coins - 30),
      freeGachaLeft: usedFree ? prev.freeGachaLeft - 1 : prev.freeGachaLeft,
      collection: [...prev.collection, ...cards],
    }));
  }, [update]);

  const handleBattleBack = useCallback((coinsEarned: number) => {
    update(prev => ({ ...prev, coins: prev.coins + coinsEarned }));
    setPage("lobby");
  }, [update]);

  const deckCards = gs.deckUids
    .map(uid => gs.collection.find(c => c.uid === uid))
    .filter(Boolean) as Card[];

  if (page === "gacha")
    return <GachaPage coins={gs.coins} freeLeft={gs.freeGachaLeft} onDraw={handleGachaDraw} onBack={() => setPage("lobby")} />;

  if (page === "battle" && deckCards.length === 8)
    return <BattlePage deckCards={deckCards} onBack={handleBattleBack} />;

  return <LobbyPage state={gs} onNavigate={setPage} onToggleDeck={handleToggleDeck} />;
}
