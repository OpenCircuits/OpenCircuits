export interface Observable<Event extends { type: string }> {
    observe(listener: (ev: Event) => void): () => void;

    emit(ev: Event): void;
}

export interface MultiObservable<Events extends Record<string, unknown>> {
    observe<K extends keyof Events>(ev: K, listener: (data: Events[K]) => void): () => void;

    emit<K extends keyof Events>(ev: K, data: Events[K]): void;
}
