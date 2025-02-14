import {MultiObservable, Observable} from "../Observable";


export function ObservableImpl<Event extends { type: string }>() {
    const listeners: Set<(ev: Event) => void> = new Set();

    return {
        observe(listener: (ev: Event) => void): () => void {
            listeners.add(listener);

            // Return a callback to unsubscribe
            return () => listeners.delete(listener);
        },
        emit(data: Event): void {
            // Shallow copy in case the callbacks try to sub/unsub while iterating
            [...listeners].forEach((c) => c(data));
        },
    } satisfies Observable<Event>;
}

export function MultiObservableImpl<Events extends Record<string, unknown>>() {
    const listeners: { [K in keyof Events]?: Set<(data: Events[K]) => void> } = {};

    return {
        observe<K extends keyof Events>(ev: K, listener: (ev: Events[K]) => void): () => void {
            if (!(ev in listeners))
                listeners[ev] = new Set();
            listeners[ev]!.add(listener);

            // Return a callback to unsubscribe
            return () => listeners[ev]!.delete(listener);
        },
        emit<K extends keyof Events>(ev: K, data: Events[K]): void {
            // Shallow copy in case the callbacks try to sub/unsub while iterating
            [...(listeners[ev] ?? [])].forEach((c) => c(data));
        },
    } satisfies MultiObservable<Events>;
}

