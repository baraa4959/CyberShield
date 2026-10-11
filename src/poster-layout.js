/** Pure, browser-independent sizing for the one approved poster artboard. */
export function measurePosterLayout(
  viewportWidth,
  viewportHeight,
  orientation = "auto",
) {
  const width = Number(viewportWidth);
  const height = Number(viewportHeight);
  if (
    !(width > 0 && height > 0) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  )
    return null;
  const forcedPortrait =
    orientation === "portrait" || orientation === "upside-down";
  const landscape =
    orientation === "landscape" || (!forcedPortrait && width > height);
  const artboardWidth = landscape ? 1280 : 720;
  const artboardHeight = landscape ? 720 : 1280;
  const scale = Math.min(width / artboardWidth, height / artboardHeight);
  return { landscape, artboardWidth, artboardHeight, scale };
}
