

export type RenderOptions = {
    useGrid: boolean;
}

/**
 * Utility class to help cut down on render times by
 *  grouping together render calls into a single call
 *  by adding them to a queue and only rendering once
 *  every 'requestAnimationFrame' time (usually 60fps).
 */
export class RenderQueue {
    private queued: number;
    private renderFunction?: (options?: RenderOptions) => void;
    private lastFrameId: number;
    private options: RenderOptions;

    /**
     * Constructor for RenderQueue.
     *
     * @param renderFunction The callback actual render function.
     * @param options        Optional options for rendering.
     * @see RenderOptions
     */
    public constructor(renderFunction?: (options?: RenderOptions) => void, options: RenderOptions = { useGrid: true }) {
        this.queued = 0;
        this.renderFunction = renderFunction;
        this.options = options;
    }

    /**
     * Call the render function and reset the queue.
     */
    private actualRender(): void {
        this.queued = 0;
        if (this.renderFunction)
            this.renderFunction(this.options);
    }

    public setOptions(options: Partial<RenderOptions>): void {
        this.options = { ...this.options, ...options };
    }

    public setRenderFunction(renderFunction?: (options?: RenderOptions) => void): void {
        this.renderFunction = renderFunction;
    }

    /**
     * Request a render frame and add to the queue.
     */
    public render(): void {
        if (this.queued === 0)
            this.lastFrameId = requestAnimationFrame(() => this.actualRender());
        this.queued++;
    }

    public cancel(): void {
        cancelAnimationFrame(this.lastFrameId);
    }

}
