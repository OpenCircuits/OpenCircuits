export interface Observable<Event extends { type: string }> {
    observe(listener: (ev: Event) => void): () => void;

    emit(ev: Event): void;
}
