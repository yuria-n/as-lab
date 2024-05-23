export function roundRate(rate: Rate, precision = 1e2): Value {
  return round(rate * 100, precision);
}

export function round(value: Value, precision = 1e2): Value {
  return Math.round(value * precision) / precision;
}

export function isNegative(value: number) {
  return value < 0 || 1 / value === -Infinity;
}
