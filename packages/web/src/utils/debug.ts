const prev = new Map<string, any>();

export function checkReferenceUpdate(obj: object) {
  for (const [key, next] of Object.entries(obj)) {
    if (prev.get(key) !== next) {
      console.log(`Update reference ${key}`);
      prev.set(key, next);
    }
  }
}
