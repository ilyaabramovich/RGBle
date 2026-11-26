import type { GameMode } from "../game";

type HeaderProps = {
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
};

const MODES: [GameMode, string][] = [
  ["daily", "Daily"],
  ["free", "Free play"],
];

export default function Header({ gameMode, onModeChange }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between gap-4">
      <h1 className="text-xl font-bold">RGBle</h1>
      <fieldset aria-label="Game mode" className="flex rounded-md border">
        {MODES.map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            aria-pressed={gameMode === mode}
            onClick={() => onModeChange(mode)}
            className="cursor-pointer px-4 py-2 font-semibold whitespace-nowrap first:rounded-l-md last:rounded-r-md focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:cursor-default aria-pressed:bg-black aria-pressed:text-white"
          >
            {label}
          </button>
        ))}
      </fieldset>
    </header>
  );
}
