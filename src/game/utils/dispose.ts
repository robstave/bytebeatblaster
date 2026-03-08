export function safeDispose<T extends { dispose?: () => void }>(value: T | null | undefined): void {
  value?.dispose?.();
}
