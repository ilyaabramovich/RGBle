import { memo } from "react";

import type { Color } from "../color";

export default memo(function Tile({ color }: { color: Color | null }) {
  if (color === null) {
    return <li aria-label="Empty tile" aria-roledescription="tile" />;
  }

  const formattedColor = color.toString();

  return (
    <li
      aria-label={formattedColor}
      aria-roledescription="tile"
      style={{ backgroundColor: formattedColor }}
    />
  );
});
