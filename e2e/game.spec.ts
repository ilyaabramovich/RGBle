import { expect, test } from "@playwright/test";

import { MAX_MOVES } from "../src/config";
import { GAME_STATUS } from "../src/game";
import {
  button,
  controlPad,
  moveCounter,
  playSomeMoves,
  playToLoss,
  playToWin,
  readColors,
  status,
} from "./game-page";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("wins the board when every move closes the gap to the target", async ({ page }) => {
  await playToWin(page);

  await expect(status(page)).toHaveText(GAME_STATUS.won);
  await expect(moveCounter(page)).toHaveText(`Moves: ${MAX_MOVES}/${MAX_MOVES}`);
  const finished = await readColors(page);
  expect(finished.current.equals(finished.target)).toBe(true);
});

test("loses the board when the last move is spent elsewhere", async ({ page }) => {
  await playToLoss(page);

  await expect(status(page)).toHaveText(GAME_STATUS.lost);
  const finished = await readColors(page);
  expect(finished.current.equals(finished.target)).toBe(false);
});

test("the controls stop taking moves once the game is over", async ({ page }) => {
  await playToLoss(page);

  await expect(status(page)).toHaveText(GAME_STATUS.lost);
  await expect(controlPad(page)).toHaveAttribute("inert", "");
  await button(page, "Increase red").click({ force: true });
  await expect(moveCounter(page)).toHaveText(`Moves: ${MAX_MOVES}/${MAX_MOVES}`);
});

test("undo takes one move off and reset takes them all", async ({ page }) => {
  const start = await readColors(page);
  const undo = button(page, "Undo");
  const reset = button(page, "Reset");

  await expect(undo).toBeDisabled();
  await expect(reset).toBeDisabled();

  await playSomeMoves(page, 3);
  await expect(moveCounter(page)).toHaveText(`Moves: 3/${MAX_MOVES}`);

  await undo.click();
  await expect(moveCounter(page)).toHaveText(`Moves: 2/${MAX_MOVES}`);

  await reset.click();
  await expect(moveCounter(page)).toHaveText(`Moves: 0/${MAX_MOVES}`);
  await expect(undo).toBeDisabled();
  expect(await readColors(page)).toEqual(start);
});

test("free play leaves the daily, and daily brings back the same board and moves", async ({
  page,
}) => {
  const dailyColors = await readColors(page);

  await expect(button(page, "Daily")).toHaveAttribute("aria-pressed", "true");
  await playSomeMoves(page, 3);

  await button(page, "Free play").click();
  await expect(button(page, "Free play")).toHaveAttribute("aria-pressed", "true");
  await expect(moveCounter(page)).toHaveText(`Moves: 0/${MAX_MOVES}`);

  await button(page, "Daily").click();
  await expect(button(page, "Daily")).toHaveAttribute("aria-pressed", "true");
  await expect(moveCounter(page)).toHaveText(`Moves: 3/${MAX_MOVES}`);
  expect((await readColors(page)).target).toEqual(dailyColors.target);
});

test("new puzzle appears only in free play and deals a fresh board", async ({ page }) => {
  await expect(button(page, "New puzzle")).toHaveCount(0);

  await button(page, "Free play").click();
  const first = await readColors(page);
  await playSomeMoves(page, 2);

  await button(page, "Daily").click();
  await button(page, "Free play").click();
  await expect(moveCounter(page)).toHaveText(`Moves: 2/${MAX_MOVES}`);

  await button(page, "New puzzle").click();
  await expect(moveCounter(page)).toHaveText(`Moves: 0/${MAX_MOVES}`);
  expect(await readColors(page)).not.toEqual(first);
});

test("a daily left open past midnight turns over when the tab comes back", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 7, 5, 23, 50) });
  await page.goto("/");
  const yesterday = await readColors(page);

  await page.clock.setSystemTime(new Date(2026, 7, 6, 9, 0));
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

  await expect.poll(() => readColors(page)).not.toEqual(yesterday);
  await expect(button(page, "Daily")).toHaveAttribute("aria-pressed", "true");
});
