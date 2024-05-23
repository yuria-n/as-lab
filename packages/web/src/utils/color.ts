import { Color, ColorKey } from '../constants';

export function getColor(color: Color, key: ColorKey = 100, alpha = 1) {
  const hex = color[key];
  if (!hex || alpha < 0 || alpha > 1) {
    throw new Error('Invalid color pram combination');
  }
  const [, r, g, b] = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) ?? [];
  return `rgba(${parse(r)}, ${parse(g)}, ${parse(b)}, ${alpha})`;
}

function parse(value = '0') {
  return parseInt(value, 16);
}
