
export interface MouseListener {

    onMouseDown(button: number): void;
    onMouseMove(button: number): void;
    onMouseDrag(button: number): void;
    onMouseUp(button: number): void;
    onClick(button: number): void;

}
