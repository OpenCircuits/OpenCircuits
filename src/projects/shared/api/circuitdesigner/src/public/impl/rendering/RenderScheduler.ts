import {ObservableImpl} from "shared/api/circuit/utils/Observable";


/**
 * Utility class to help cut down on render times by
 *  grouping together render calls into a single call
 *  by adding them to a scheduler and only rendering once
 *  every 'requestAnimationFrame' time (usually 60fps).
 */
export class RenderScheduler extends ObservableImpl {
    private queued: number;
    private lastFrameId: number;

    /**
     * Constructor for RenderQueue.
     */
    public constructor() {
        super();

        this.queued = 0;
        this.lastFrameId = -1;
    }

    /**
     * Call the render function and reset the queue.
     */
    private actualRender(): void {
        this.queued = 0;
        this.publish({});
    }

    /**
     * Request a render frame and add to the queue.
     */
    public requestRender(): void {
        // Do nothing when blocked
        if (this.blocked)
            return;

        if (this.queued === 0)
            this.lastFrameId = requestAnimationFrame(() => this.actualRender());
        this.queued++;
    }

    public cancel(): void {
        // Do nothing when blocked
        if (this.blocked)
            return;

        cancelAnimationFrame(this.lastFrameId);
    }

}
