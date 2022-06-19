/**
 * A representation of a Shape.
 */
export interface Shape {
    /**
     * Draws the Shape on the canvas.
     *
     * @param ctx Provides the 2D rendering context for the drawing surface of an element.
     */
    draw(ctx: CanvasRenderingContext2D): void;

}
