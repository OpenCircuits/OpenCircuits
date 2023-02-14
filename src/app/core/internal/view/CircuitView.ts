import {Matrix2x3} from "math/Matrix";
import {V} from "Vector";
import {CircuitInternal} from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";
import {CameraView} from "./CameraView";
import {RenderGrid} from "./rendering/renderers/GridRenderer";
import {RenderHelper} from "./rendering/RenderHelper";
import {defaultRenderOptions, RenderOptions} from "./rendering/RenderOptions";
import {RenderState} from "./rendering/RenderState";
import {Style} from "./rendering/Style";
import {RenderQueue} from "./RenderQueue";


export class CircuitView {
    private readonly circuit: CircuitInternal;
    private readonly selections: SelectionsManager;

    private readonly camera: CameraView;

    private readonly options: RenderOptions;

    private readonly queue: RenderQueue;
    private readonly renderer: RenderHelper;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager) {
        this.circuit = circuit;
        this.selections = selections;

        this.camera = new CameraView(circuit);

        this.options = { ...defaultRenderOptions };

        this.queue = new RenderQueue();
        this.renderer = new RenderHelper(this.camera);

        // Subscribe to renders, actually render
        this.queue.subscribe(() => this.renderInternal());
    }

    protected renderInternal() {
        const state: RenderState = {
            circuit:    this.circuit,
            selections: this.selections,
            camera:     this.camera,
            options:    this.options,
            renderer:   this.renderer,
        };
        this.renderer.clear();

        // console.log(this.camera.matrix.inverse().translate);

        // this.renderer.save();
        // this.renderer.toWorldSpace();
        // // this.renderer.transform(new Matrix2x3([0,5, -5,0, 400,400]));
        // this.renderer.setStyle(new Style(undefined, "#ff00ff", 0.02));
        // this.renderer.beginPath();
        // this.renderer.pathLine(V(0, 0), V(1, 1));
        // this.renderer.stroke();
        // this.renderer.restore();

        // Render grid
        if (this.options.showGrid)
            RenderGrid(state);

        // Render wires
        
        // Render components

        // Debug rendering

        // callback for rendering
    }

    public resize(w: number, h: number) {
        // Request a render on resize
        this.queue.requestRender();

        // Update camera
        this.camera.resize(w, h);
    }

    public setCanvas(canvas?: HTMLCanvasElement) {
        this.renderer.setCanvas(canvas);
    }
}
