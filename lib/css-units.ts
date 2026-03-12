const DEFAULT_ROOT_FONT_SIZE = 14;

export function toRem(value: number, baseFontSize = DEFAULT_ROOT_FONT_SIZE) {
  const remValue = value / baseFontSize;
  return `${Number(remValue.toFixed(4))}rem`;
}

export function getRootFontSize() {
  if (typeof window === 'undefined') return DEFAULT_ROOT_FONT_SIZE;

  const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(rootFontSize) && rootFontSize > 0 ? rootFontSize : DEFAULT_ROOT_FONT_SIZE;
}
