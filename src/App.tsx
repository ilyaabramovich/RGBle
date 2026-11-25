import { useEffect, useState } from "react";

import Header from "./components/Header";
import Puzzle from "./components/Puzzle";
import { Game } from "./game";

function App() {
  const [game, setGame] = useState<Game>(() => new Game("daily"));

  useEffect(() => {
    const rollOver = () => {
      if (document.visibilityState === "visible") {
        setGame((game) => (game.isStale() ? new Game("daily") : game));
      }
    };

    document.addEventListener("visibilitychange", rollOver);

    return () => document.removeEventListener("visibilitychange", rollOver);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center gap-4 p-4">
      <Header gameMode={game.mode} onModeChange={(mode) => setGame(new Game(mode))} />
      <main className="flex w-full max-w-md flex-1">
        <Puzzle key={game.id} initialColor={game.initialColor} targetColor={game.targetColor} />
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
