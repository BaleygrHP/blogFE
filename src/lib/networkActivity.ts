type Listener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) {
    listener(pendingCount);
  }
}

export function getPendingCount(): number {
  return pendingCount;
}

export function beginRequest(): () => void {
  pendingCount += 1;
  notify();

  let done = false;
  return () => {
    if (done) return;
    done = true;
    pendingCount = Math.max(0, pendingCount - 1);
    notify();
  };
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(pendingCount);

  return () => {
    listeners.delete(listener);
  };
}
