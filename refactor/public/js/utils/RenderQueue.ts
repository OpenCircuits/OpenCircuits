
/**
 * Utility class to help cut down on render times by
 *  grouping together render calls into a single call
 *  by adding them to a queue and only rendering once
 *  every 'requestAnimationFrame' time (usually 60fps)
 */
export class RenderQueue {
    private queued: number;
    private renderFunction: () => void;

    /**
     * Constructor for RenderQueue
     * @param renderFunction The callback actual render function
     */
    constructor(renderFunction: () => void) {
        this.queued = 0;
        this.renderFunction = renderFunction;
    }

    /**
     * Call the render function and reset the queue
     */
    private actualRender(): void {
        this.queued = 0;
        this.renderFunction();
    }

    /**
     * Request a render frame and add to the queue
     */
    public render(): void {
        if (this.queued === 0)
            requestAnimationFrame(() => this.actualRender());
        this.queued++;
    }

}
