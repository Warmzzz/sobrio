
export function getRandomUniqueId(): string {
  return (typeof window.crypto !== "undefined" && window.crypto.randomUUID)
    ? window.crypto.randomUUID()
    : "sobrio-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now();
}