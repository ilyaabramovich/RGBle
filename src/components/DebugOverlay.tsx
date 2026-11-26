import type { Color } from "../color";

export default function DebugOverlay({ colors }: { colors: Color[] }) {
  return (
    <pre>
      <small>
        {colors
          .map((color) =>
            color
              .channels()
              .map((v) => String(v).padStart(3))
              .join(" "),
          )
          .join("\n")}
      </small>
    </pre>
  );
}
