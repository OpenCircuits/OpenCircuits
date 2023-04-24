import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";

import {BezierCurve} from "math/BezierCurve";
import {Matrix2x3}   from "math/Matrix";
import {Transform}   from "math/Transform";

import {None,Option,Some} from "core/utils/Result";
import {Observable}       from "core/utils/Observable";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";

import {Assembler} from "./Assembler";
import {Prims}     from "./Prim";
import {PortPos}   from "./PortAssembler";

import {RenderGrid}                          from "./rendering/renderers/GridRenderer";
import {RenderHelper}                        from "./rendering/RenderHelper";
import {DefaultRenderOptions, RenderOptions} from "./rendering/RenderOptions";
import {RenderScheduler}                     from "./rendering/RenderScheduler";


export class CircuitViewAssetManager<T> extends Observable<{ key: string, val: T }> {
    private readonly assets: Map<string, T>;

    public constructor() {
        super();

        this.assets = new Map();
    }

    public get(key: string): T | undefined {
        return this.assets.get(key);
    }
    public set(key: string, val: T) {
        this.assets.set(key, val);
        this.publish({ key, val });
    }
}

export abstract class CircuitView extends Observable<{ renderer: RenderHelper }> {
    public readonly circuit: CircuitInternal;
    public readonly selections: SelectionsManager;

    public readonly options: RenderOptions;

    public readonly scheduler: RenderScheduler;
    public readonly renderer: RenderHelper;

    public cameraMat: Matrix2x3;

    public componentTransforms: Map<GUID, Transform>;
    public componentPrims: Map<GUID, Prims>;

    public localPortPositions: Map<GUID, PortPos>; // Key'd by port ID
    public portPositions: Map<GUID, PortPos>; // Key'd by port ID
    public portPrims: Map<GUID, Prims>; // Key'd by component parent

    public wireCurves: Map<GUID, BezierCurve>;
    public wirePrims: Map<GUID, Prims>;

    public images: CircuitViewAssetManager<SVGDrawing>;

    public constructor(circuit: CircuitInternal, selections: SelectionsManager) {
        super();

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

        this.images = new CircuitViewAssetManager();

        this.scheduler.subscribe(() => this.render());

        this.circuit.subscribe((ev) => {
            // TODO[model_refactor_api](leon) - use events

            // update components first
            for (const compID of circuit.doc.getComponents()) {
                const comp = circuit.doc.getCompByID(compID).unwrap();
                this.getAssemblerFor(comp.kind).assemble(comp, ev);
            }

            // temporary hack to handle deleting components (and ports)
            for (const compID of this.componentPrims.keys()) {
                if (!circuit.doc.hasComp(compID)) {
                    this.componentPrims.delete(compID);
                    this.componentTransforms.delete(compID);
                    this.portPrims.delete(compID);
                }
            }
            for (const portID of this.portPositions.keys()) {
                if (!circuit.doc.hasPort(portID)) {
                    this.portPositions.delete(portID);
                    this.localPortPositions.delete(portID);
                }
            }

            // then update wires
            for (const wireID of circuit.doc.getWires()) {
                const wire = circuit.doc.getWireByID(wireID).unwrap();
                this.getAssemblerFor(wire.kind).assemble(wire, ev);
            }

            // temporary hack to handle deleting wires
            for (const wireID of this.wirePrims.keys()) {
                if (!circuit.doc.hasWire(wireID)) {
                    this.wireCurves.delete(wireID);
                    this.wirePrims.delete(wireID);
                }
            }

            this.cameraMat = this.calcCameraMat();

            this.scheduler.requestRender();
        });

        this.selections.subscribe((ev) => {
            ev.selections.forEach((id) => {
                const obj = circuit.doc.getObjByID(id).unwrap();
                this.getAssemblerFor(obj.kind).assemble(obj, ev);
            });

            this.scheduler.requestRender();
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

    public findNearestObj(pos: Vector, filter: (id: GUID) => boolean = ((_) => true)): Option<GUID> {
        for (const [id, prims] of this.componentPrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => prim.hitTest(pos)))
                return Some(id);
            // TODO[model_refactor_api](leon): hit test the component's ports as well
        }
        for (const [id, prims] of this.wirePrims) {
            if (!filter(id)) // Skip things not in the filter
                continue;
            if (prims.some((prim) => prim.hitTest(pos)))
                return Some(id);
        }
        return None();
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
        // TODO[model_refactor](leon) - render by depth
        this.wirePrims.forEach((prims) => {
            prims.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });
        });

        // Render components
        // TODO[model_refactor](leon) - render by depth
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

        // Debug rendering

        // Callback for post-rendering
        this.publish({ renderer: this.renderer });
        this.renderer.restore();
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

    public setCanvas(canvas?: HTMLCanvasElement) {
        this.renderer.setCanvas(canvas);
    }

    public getCanvas(): HTMLCanvasElement | undefined {
        return this.renderer.canvas;
    }
}
