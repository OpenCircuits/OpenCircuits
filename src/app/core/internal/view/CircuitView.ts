import {CircuitInternal} from "../impl/CircuitInternal";


export class CircuitView {
    private readonly circuit: CircuitInternal;

    private canvas: HTMLCanvasElement;

    public constructor(circuit: CircuitInternal, canvas: HTMLCanvasElement) {
        this.circuit = circuit;
        this.canvas = canvas;
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        throw new Error("Unimplemented");
    }
}
