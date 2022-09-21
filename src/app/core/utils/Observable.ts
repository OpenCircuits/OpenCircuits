
export abstract class Observable<T = unknown> {
    protected callbacks: Set<(data: T) => void>;

    protected constructor() {
        this.callbacks = new Set<(data: T) => void>();
    }

    protected publish(data: T) {
        this.callbacks.forEach((c) => c(data));
    }

    public subscribe(callbackFn: (data: T) => void) {
        this.callbacks.add(callbackFn);
    }

    public unsubscribe(callbackFn: (data: T) => void) {
        this.callbacks.delete(callbackFn);
    }
}
