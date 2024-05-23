export function toParamOptions<T extends string | number | symbol>(params: T[], textMap: Record<T, string>) {
  return params.map((param) => ({
    key: param,
    value: param,
    text: textMap[param],
  }));
}
