import { Scheduler } from "digital/api/circuit/public";

export class TimedScheduler implements Scheduler {
    private curTimeout?: number;

    public schedule(callback: () => void, delayMs: number): void {
        if (this.curTimeout !== undefined) {
            return;
        }
        this.curTimeout = window.setTimeout(() => {
            this.curTimeout = undefined;
            callback();
        }, delayMs);
    }

    public cancel(): void {
        if (this.curTimeout !== undefined) {
            window.clearTimeout(this.curTimeout);
            this.curTimeout = undefined;
        }
    }
}
