import { describe, expect, it } from "vitest";

import { BLACK, CHANNELS, Color, WHITE } from "./color";
import { createRandomInt } from "./random";

const randomColor = () => new Color(Math.floor(Math.random() * 0x1000000));

const luminance = (color: Color) =>
  color
    .channels()
    .map((value) => {
      const c = value / 255;

      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, c, i) => sum + [0.2126, 0.7152, 0.0722][i] * c, 0);

const ratio = (a: Color, b: Color) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

describe("Color", () => {
  it("packs a channel triple back into a color", () => {
    expect(Color.pack([10, 20, 30]).value).toBe(0x0a141e);
    expect(Color.pack([255, 255, 255]).value).toBe(0xffffff);
  });
});

describe("Color.random", () => {
  it("seeds land in the 24-bit color space", () => {
    for (let seed = 0; seed < 500; seed++) {
      const color = Color.random(createRandomInt(seed));

      expect(Number.isInteger(color.value)).toBe(true);
      expect(color.value).toBeGreaterThanOrEqual(0);
      expect(color.value).toBeLessThanOrEqual(0xffffff);
    }
  });
});

describe("offset", () => {
  it("applies each offset to its own channel", () => {
    expect(new Color(0x646464).offset([10, -10, 0]).value).toBe(0x6e5a64);
  });

  it("clamps at zero instead of going negative", () => {
    expect(new Color(0x000a0a).offset([-24, 0, 0]).value).toBe(0x000a0a);
  });

  it("clamps at 255", () => {
    expect(new Color(0xfa0000).offset([10, 0, 0]).value).toBe(0xff0000);
  });
});

describe("offsetChannel", () => {
  it("changes only the requested channel", () => {
    expect(new Color(0x646464).offsetChannel(0, 10).value).toBe(0x6e6464);
    expect(new Color(0x646464).offsetChannel(1, 10).value).toBe(0x646e64);
    expect(new Color(0x646464).offsetChannel(2, 10).value).toBe(0x64646e);
  });

  it("clamps within the channel without bleeding into its neighbours", () => {
    expect(new Color(0x00ff00).offsetChannel(1, 1).value).toBe(0x00ff00);
    expect(new Color(0xff00ff).offsetChannel(1, -1).value).toBe(0xff00ff);
    expect(new Color(0x00ff00).offsetChannel(1, -256).value).toBe(0x000000);
  });

  it("agrees with offset for every channel", () => {
    const color = new Color(0x123456);

    for (const { channel } of CHANNELS) {
      for (const amount of [-40, -10, 0, 10, 40]) {
        const offsets = [0, 0, 0];
        offsets[channel] = amount;

        expect(color.offsetChannel(channel, amount).value).toBe(color.offset(offsets).value);
      }
    }
  });
});

describe("contrasting", () => {
  it("returns white on dark colors and black on light ones", () => {
    expect(new Color(0x000000).contrasting().value).toBe(0xffffff);
    expect(new Color(0xffffff).contrasting().value).toBe(0x000000);
    expect(new Color(0x0000ff).contrasting().value).toBe(0xffffff);
    expect(new Color(0x00ff00).contrasting().value).toBe(0x000000);
  });

  it("always picks whichever of black or white contrasts more", () => {
    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const chosen = color.contrasting();
      const rejected = chosen.equals(WHITE) ? BLACK : WHITE;

      expect(ratio(color, chosen)).toBeGreaterThanOrEqual(ratio(color, rejected));
    }
  });

  it("clears the 4.5:1 threshold on the colors the game can generate", () => {
    let worst = Infinity;

    for (let i = 0; i < 500; i++) {
      const color = randomColor();
      const l = luminance(color);
      const contrast = color.contrasting().equals(WHITE) ? 1.05 / (l + 0.05) : (l + 0.05) / 0.05;

      worst = Math.min(worst, contrast);
    }

    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it("flips from white to black exactly at the contrast threshold", () => {
    const pivot = Math.sqrt(1.05 * 0.05) - 0.05;
    const greys = Array.from({ length: 256 }, (_, v) => new Color((v << 16) | (v << 8) | v));

    const flip = greys.findIndex((color) => color.contrasting().equals(BLACK));

    expect(flip).toBe(greys.findIndex((color) => luminance(color) > pivot));
    expect(greys[flip - 1].contrasting().equals(WHITE)).toBe(true);
    expect(greys[flip].contrasting().equals(BLACK)).toBe(true);
  });
});

describe("mix", () => {
  it("averages each channel independently", () => {
    expect(new Color(0x000000).mix(new Color(0xffffff)).value).toBe(0x808080);
    expect(new Color(0x0a1400).mix(new Color(0x141e00)).value).toBe(0x0f1900);
  });

  it("stays inside the channel range and between the two inputs", () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = [randomColor(), randomColor()];
      const mixed = a.mix(b).channels();

      a.channels().forEach((low, channel) => {
        const [min, max] = [low, b.channels()[channel]].sort((x, y) => x - y);

        expect(Number.isInteger(mixed[channel])).toBe(true);
        expect(mixed[channel]).toBeGreaterThanOrEqual(min);
        expect(mixed[channel]).toBeLessThanOrEqual(max);
      });
    }
  });
});

describe("toString", () => {
  it("zero-pads to six digits", () => {
    expect(new Color(0x000000).toString()).toBe("#000000");
    expect(new Color(0x000522).toString()).toBe("#000522");
    expect(new Color(0xffffff).toString()).toBe("#ffffff");
  });
});

describe("describe", () => {
  it("names each channel with its value", () => {
    expect(new Color(0x0a141e).describe()).toBe("red 10, green 20, blue 30");
    expect(new Color(0x000000).describe()).toBe("red 0, green 0, blue 0");
    expect(new Color(0xffffff).describe()).toBe("red 255, green 255, blue 255");
  });
});

describe("channels", () => {
  it("unpacks the channels in red, green, blue order", () => {
    expect(new Color(0x0a141e).channels()).toEqual([10, 20, 30]);
    expect(new Color(0x000000).channels()).toEqual([0, 0, 0]);
    expect(new Color(0xffffff).channels()).toEqual([255, 255, 255]);
  });
});
