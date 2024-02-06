import {Observable} from "../Observable";


export function ObservableImpl<Event extends { type: string }>() {
    const listeners: Set<(ev: Event) => void> = new Set();

    return {
        observe(listener: (ev: Event) => void): () => void {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        emit(ev: Event): void {
            listeners.forEach((listener) => listener(ev));
        },
    } satisfies Observable<Event>;
}
