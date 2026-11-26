import { useEffect, useState } from "react";

import type { Color } from "./color";
import type { GameMode } from "./game";

import Header from "./components/Header";
import Puzzle from "./components/Puzzle";
import { Game } from "./game";

type Session = { game: Game; moves: Color[] };

const start = (mode: GameMode): Session => ({ game: new Game(mode), moves: [] });

function App() {
  const [mode, setMode] = useState<GameMode>("daily");
  // One session per mode, so switching away and back keeps each board's moves.
  const [sessions, setSessions] = useState(() => ({ daily: start("daily"), free: start("free") }));
  const { game, moves } = sessions[mode];

  useEffect(() => {
    const rollOver = () => {
      if (document.visibilityState === "visible") {
        setSessions((s) => (s.daily.game.isStale() ? { ...s, daily: start("daily") } : s));
      }
    };

    document.addEventListener("visibilitychange", rollOver);

    return () => document.removeEventListener("visibilitychange", rollOver);
  }, []);

  const updateMoves = (update: (moves: Color[]) => Color[]) => {
    setSessions((s) => ({ ...s, [mode]: { ...s[mode], moves: update(s[mode].moves) } }));
  };

  const newPuzzle = () => setSessions((s) => ({ ...s, free: start("free") }));

  return (
    <div className="flex min-h-dvh flex-col items-center gap-4 p-4">
      <Header gameMode={mode} onModeChange={setMode} />
      <main className="flex w-full max-w-md flex-1">
        <Puzzle
          key={game.id}
          initialColor={game.initialColor}
          targetColor={game.targetColor}
          moves={moves}
          onMovesChange={updateMoves}
          onNewPuzzle={mode === "free" ? newPuzzle : undefined}
        />
      </main>
      <footer>
        <small>
          Made by <a href="https://github.com/ilyaabramovich">@ilyabramovich</a>
        </small>
      </footer>
    </div>
  );
}

export default App;
