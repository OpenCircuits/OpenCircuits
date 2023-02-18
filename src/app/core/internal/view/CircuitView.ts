import {SVGDrawing} from "svg2canvas";
import {GUID} from "..";
import {CircuitInternal} from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";
import {CameraView} from "./CameraView";
import {ComponentView} from "./ComponentView";
import {RenderGrid} from "./rendering/renderers/GridRenderer";
import {RenderHelper} from "./rendering/RenderHelper";
import {DefaultRenderOptions, RenderOptions} from "./rendering/RenderOptions";
import {RenderState} from "./rendering/RenderState";
import {RenderQueue} from "./RenderQueue";


export abstract class CircuitView {
    protected readonly circuit: CircuitInternal;
    protected readonly selections: SelectionsManager;

    protected readonly camera: CameraView;

    protected readonly options: RenderOptions;

    protected readonly queue: RenderQueue;
    protected readonly renderer: RenderHelper;

    protected componentViews: Map<GUID, ComponentView>;
    // protected wireViews: Map<GUID, WireView>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager) {
        this.circuit = circuit;
        this.selections = selections;

        this.camera = new CameraView(circuit);

        this.options = new DefaultRenderOptions();

        this.queue = new RenderQueue();
        this.renderer = new RenderHelper(this.camera);

        this.componentViews = new Map();
        // this.wireViews = new Map();

        // Subscribe to renders, actually render
        this.queue.subscribe(() => this.renderInternal());

        // Subscribe to circuit changes
        circuit.subscribe(() => {
            // TODO: Actually listen to the subscription event

            for (const objID of circuit.getObjs()) {
                if (circuit.hasComp(objID)) {
                    const comp = circuit.getCompByID(objID)!;

                    // Add to views map if we don't have it yet
                    if (!this.componentViews.has(objID)) {
                        this.componentViews.set(objID, this.constructComponentView(comp.kind, objID));
                    } else {
                        // Else edit
                        this.componentViews.get(objID)!.setDirty();
                    }
                }
            }

            // Request a render on circuit change
            this.queue.requestRender();
        });

        // Subscribe to selection changes
        selections.subscribe((ev) => {
            // ev.selections.forEach((id) => {
            //     const obj = this.circuit.getObjByID(id);
            //     if (!obj)
            //         throw new Error(`CircuitView: Failed to find object in selection change with ID ${id}!`);
                
            //     // Dirty object
            //     if (obj.baseKind === "Component")
            //         this.componentViews.get(id)!.setDirty();
            //     else if (obj.baseKind === "Port")
            //         this.componentViews.get(obj.parent)!.setDirty();
            //     // else
            //     //    this.wireViews.get(id)!.setDirty();
            // });

            // Request a render on circuit change
            this.queue.requestRender();
        });
    }

    protected get state(): RenderState {
        return {
            circuit:    this.circuit,
            selections: this.selections,
            camera:     this.camera,
            options:    this.options,
            renderer:   this.renderer,
        };
    }

    protected abstract constructComponentView(kind: string, id: GUID): ComponentView;

    protected renderInternal() {
        this.renderer.clear();

        // Render grid
        if (this.options.showGrid)
            RenderGrid(this.state);

        // Render wires
        
        // Render components
        // TODO: Render by depth
        this.componentViews.forEach((view) => view.render());

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

    public addImage(imgSrc: string, img: SVGDrawing) {
        this.options.addImage(imgSrc, img);
    }
}
