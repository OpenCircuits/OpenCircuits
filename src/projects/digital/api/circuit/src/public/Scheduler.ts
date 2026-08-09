export interface Scheduler {
    /**
     * Schedules a callback to run after delayMs milliseconds.
     */
    schedule(callback: () => void, delayMs: number): void;

    /**
     * Cancels any pending scheduled callback.
     */
    cancel(): void;
}
