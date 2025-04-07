export interface Observable<Event = unknown> {
    subscribe(listener: (ev: Event) => void): () => void;
    unsubscribe(listener: (ev: Event) => void): void;

    setBlocked(blocked: boolean): void;
    block(): void;
    unblock(): void;

    publish(ev: Event): void;
}

export abstract class ObservableImpl<Event = unknown> implements Observable<Event> {
    protected blocked: boolean;
    protected callbacks: Set<(data: Event) => void>;

    protected constructor() {
        this.blocked = false;
        this.callbacks = new Set();
    }

    public publish(data: Event) {
        // Blocked so don't trigger callbacks
        if (this.blocked)
            return;

        // Shallow copy in case the callbacks try to sub/unsub while iterating
        [...this.callbacks].forEach((c) => {
            try {
                c(data);
            } catch (e) {
                // Don't let errors thrown by subscribers to cancel others
                console.error(e);
            }
        });
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


export abstract class MultiObservable<Events extends Record<string, unknown>> {
    protected blocked: boolean;
    protected callbacks: { [K in keyof Events]?: Set<(data: Events[K]) => void> };

    protected constructor() {
        this.blocked = false;
        this.callbacks = {};
    }

    protected publish<K extends keyof Events>(ev: K, data: Events[K]) {
        // Blocked so don't trigger callbacks
        if (this.blocked)
            return;

        // Shallow copy in case the callbacks try to sub/unsub while iterating
        [...(this.callbacks[ev] ?? [])].forEach((c) => c(data));
    }

    protected unsubscribeAll<K extends keyof Events>(ev: K) {
        this.callbacks[ev]?.clear();
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

    public subscribe<K extends keyof Events>(ev: K, callbackFn: (data: Events[K]) => void) {
        if (!(ev in this.callbacks))
            this.callbacks[ev] = new Set();
        this.callbacks[ev]!.add(callbackFn);

        // Return a callback to unsubscribe
        return () => this.unsubscribe(ev, callbackFn);
    }

    public unsubscribe<K extends keyof Events>(ev: K, callbackFn: (data: Events[K]) => void) {
        if (!(ev in this.callbacks))
            return;
        this.callbacks[ev]!.delete(callbackFn);
    }
}
