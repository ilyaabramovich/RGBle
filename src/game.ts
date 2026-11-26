import { Color } from "./color";
import { MAX_MOVES, STEP } from "./config";
import { dailySeed, generateOffsets } from "./puzzle";
import { createRandomInt } from "./random";

export type GameMode = "daily" | "free";
export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export const GAME_STATUS = {
  won: "You won yay!",
  lost: "Not this time",
} as const;

let nextId = 0;

export class Game {
  readonly mode: GameMode;
  readonly id: number;
  readonly seed: number | undefined;
  readonly initialColor: Color;
  readonly targetColor: Color;

  constructor(mode: GameMode, seed?: number) {
    this.mode = mode;
    // crypto.randomUUID would throw on plain-http LAN origins, which are not secure contexts.
    this.id = nextId++;
    this.seed = seed ?? (mode === "daily" ? dailySeed() : undefined);

    const randomInt = createRandomInt(this.seed);
    const initialColor = Color.random(randomInt);
    const offsets = generateOffsets(MAX_MOVES, initialColor, STEP, randomInt);

    this.initialColor = initialColor;
    this.targetColor = initialColor.offset(offsets);
  }

  isStale(date = new Date()): boolean {
    return this.mode === "daily" && this.seed !== dailySeed(date);
  }
}
