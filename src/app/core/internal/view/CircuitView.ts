import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";

import {BezierCurve} from "math/BezierCurve";
import {Matrix2x3}   from "math/Matrix";
import {Transform}   from "math/Transform";

import {GUID}                                from "..";
import {CircuitInternal}                     from "../impl/CircuitInternal";
import {SelectionsManager}                   from "../impl/SelectionsManager";
import {Assembler}                           from "./Assembler";
import {Prims}                               from "./Prim";
import {RenderGrid}                          from "./rendering/renderers/GridRenderer";
import {RenderHelper}                        from "./rendering/RenderHelper";
import {DefaultRenderOptions, RenderOptions} from "./rendering/RenderOptions";
import {RenderScheduler}                     from "./rendering/RenderScheduler";
import {PortPos}                             from "./PortAssembler";


export abstract class CircuitView {
    public readonly circuit: CircuitInternal;
    public readonly selections: SelectionsManager;

    public readonly options: RenderOptions;

    public readonly scheduler: RenderScheduler;
    public readonly renderer: RenderHelper;

    public cameraMat: Matrix2x3;

    public componentTransforms: Map<GUID, Transform>;
    public componentPrims: Map<GUID, Prims>;

    public localPortPositions: Map<GUID, PortPos>;
    public portPositions: Map<GUID, PortPos>;
    public portPrims: Map<GUID, Prims>;

    public wireCurves: Map<GUID, BezierCurve>;
    public wirePrims: Map<GUID, Prims>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager) {
        this.circuit = circuit;
        this.selections = selections;

        this.options = new DefaultRenderOptions();

        this.scheduler = new RenderScheduler();
        this.renderer = new RenderHelper();

        this.cameraMat = this.calcCameraMat();

        this.componentTransforms = new Map();
        this.componentPrims = new Map();

        this.localPortPositions = new Map();
        this.portPositions = new Map();
        this.portPrims = new Map();

        this.wireCurves = new Map();
        this.wirePrims = new Map();

        this.scheduler.subscribe(() => this.render());

        this.circuit.subscribe((ev) => {
            // TODO: use event

            // update components first
            for (const compID of circuit.getComponents()) {
                const comp = circuit.getCompByID(compID).unwrap();
                this.getAssemblerFor(comp.kind).assemble(comp, ev);
            }

            // then update wires
            for (const wireID of circuit.getWires()) {
                const wire = circuit.getWireByID(wireID).unwrap();
                this.getAssemblerFor(wire.kind).assemble(wire, ev);
            }

            this.cameraMat = this.calcCameraMat();

            this.scheduler.requestRender();
        });

        this.selections.subscribe((ev) => {
            ev.selections.forEach((id) => {
                const obj = circuit.getObjByID(id).unwrap();
                this.getAssemblerFor(obj.kind).assemble(obj, ev);
            });
        });
    }

    protected calcCameraMat() {
        const camera = this.circuit.getCamera();

        return new Matrix2x3(V(camera.x, camera.y), 0, V(camera.zoom, -camera.zoom));
    }

    public toWorldPos(pos: Vector): Vector {
        return this.cameraMat.mul(pos.sub(this.renderer.size.scale(0.5)));
    }
    public toScreenPos(pos: Vector): Vector {
        return this.cameraMat.inverse().mul(pos).add(this.renderer.size.scale(0.5));
    }

    protected abstract getAssemblerFor(kind: string): Assembler;

    protected render(): void {
        // Clear canvas
        this.renderer.clear();

        this.renderer.save();

        // Transform to world-space
        this.renderer.toWorldSpace(this.cameraMat);

        // Render grid
        if (this.options.showGrid)
            RenderGrid(this);

        // Render wires
        // TODO render by depth
        this.wirePrims.forEach((prims) => {
            prims.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });
        });

        // Render components
        // TODO render by depth
        this.componentPrims.forEach((prims, compID) => {
            // Draw ports first
            this.portPrims.get(compID)?.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            })

            // Draw prims for component
            prims.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });
        });
        this.renderer.restore();

        // Debug rendering

        // Callback for post-rendering
    }

    public getContextUtils() {
        return {
            createRadialGradient: (pos: Vector, radius: number) =>
                this.renderer.createRadialGradient(pos, 0, pos, radius),
        };
    }

    public resize(w: number, h: number) {
        // Request a render on resize
        this.scheduler.requestRender();
    }

    public addImage(imgSrc: string, img: SVGDrawing) {
        this.options.addImage(imgSrc, img);
    }

    public setCanvas(canvas?: HTMLCanvasElement) {
        this.renderer.setCanvas(canvas);
    }

    public getCanvas(): HTMLCanvasElement | undefined {
        return this.renderer.canvas;
    }
}
