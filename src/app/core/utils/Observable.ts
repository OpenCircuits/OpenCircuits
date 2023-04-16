export abstract class Observable<Event = unknown> {
    protected blocked: boolean;
    protected callbacks: Set<(data: Event) => void>;

    protected constructor() {
        this.blocked = false;
        this.callbacks = new Set<(data: Event) => void>();
    }

    protected publish(data: Event) {
        // Blocked so don't trigger callbacks
        if (this.blocked)
            return;

        // Shallow copy in case the callbacks try to sub/unsub while iterating
        [...this.callbacks].forEach((c) => c(data));
    }

    protected unsubscribeAll() {
        this.callbacks.clear();
    }

    public setBlocked(blocked: boolean): void {
        this.blocked = blocked;
    }

    /**
     * Sets blocked to true, prevents Callbacks from getting Events.
     */
    public block(): void {
        this.blocked = true;
    }

    /**
     * Sets blocked to false, allows Callbacks to get Events again.
     */
    public unblock(): void {
        this.blocked = false;
    }

    public subscribe(callbackFn: (data: Event) => void) {
        this.callbacks.add(callbackFn);

        // Return a callback to unsubscribe
        return () => this.unsubscribe(callbackFn);
    }

    public unsubscribe(callbackFn: (data: Event) => void) {
        this.callbacks.delete(callbackFn);
    }
}
