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

    private readonly dirtyComponents: Set<GUID>;
    private readonly dirtyWires: Set<GUID>;
    private readonly dirtyPorts: Set<GUID>;

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

        this.dirtyComponents = new Set();
        this.dirtyWires = new Set();
        this.dirtyPorts = new Set();

        this.scheduler.subscribe(() => this.render());
        this.scheduler.setBlocked(true);

        this.circuit.subscribe((ev) => {
            // TODO[model_refactor_api](leon) - use events better, i.e. how to we collect the diffs until the next
            //                                  render cycle or query for the dirty object(s)?

            // Mark all added/removed component dirty
            for (const compID of ev.addedComponents)
                this.dirtyComponents.add(compID);
            for (const compID of ev.removedComponents)
                this.dirtyComponents.add(compID);

            // Mark all components w/ changed ports dirty
            for (const compID of ev.portsChanged)
                this.dirtyComponents.add(compID);

            // Mark all added/removed wires dirty
            for (const wireID of ev.addedWires)
                this.dirtyWires.add(wireID);
            for (const wireID of ev.removedWires)
                this.dirtyWires.add(wireID);

            // Mark all changed obj props dirty
            for (const [id, props] of ev.propsChanged) {
                if (circuit.doc.hasComp(id)) {
                    this.dirtyComponents.add(id);

                    // Component transform changed, update connected wires
                    if (props.has("x") || props.has("y") || props.has("angle")) {
                        const ports = this.circuit.doc.getPortsForComponent(id);
                        ports.map((ports) => ports.forEach((portID) => {
                            this.circuit.doc.getWiresForPort(portID)
                                .map((wires) => wires.forEach((wireID) => this.dirtyWires.add(wireID)))
                        }))
                    }
                } else if (circuit.doc.hasWire(id))
                    this.dirtyWires.add(id);
                else if (circuit.doc.hasPort(id))
                    this.dirtyPorts.add(id);
            }

            this.cameraMat = this.calcCameraMat();

            this.scheduler.requestRender();
        });

        this.selections.subscribe((ev) => {
            ev.selections.forEach((id) => {
                if (circuit.doc.hasComp(id))
                    this.dirtyComponents.add(id);
                else if (circuit.doc.hasWire(id))
                    this.dirtyWires.add(id);
                else if (circuit.doc.hasPort(id))
                    this.dirtyPorts.add(id);
            });

            this.scheduler.requestRender();
        });
    }

    private updateDirtyObjs() {
        // Update components first
        for (const compID of this.dirtyComponents) {
            // If component still exists, update it
            if (this.circuit.doc.hasComp(compID)) {
                const comp = this.circuit.doc.getCompByID(compID).unwrap();
                // TODO[model_refactor_api](leon) - figure out `ev` param
                this.getAssemblerFor(comp.kind).assemble(comp, {});
                continue;
            }
            // Otherwise, component was deleted so remove it and any associated ports
            this.componentPrims.delete(compID);
            this.componentTransforms.delete(compID);
            this.portPrims.delete(compID);
        }
        this.dirtyComponents.clear();

        // Remove any ports that were deleted
        for (const portID of this.dirtyPorts) {
            if (!this.circuit.doc.hasPort(portID)) {
                this.portPositions.delete(portID);
                this.localPortPositions.delete(portID);
            }
        }
        this.dirtyPorts.clear();

        // Then update wires
        for (const wireID of this.dirtyWires) {
            // If wire still exists, update it
            if (this.circuit.doc.hasWire(wireID)) {
                const wire = this.circuit.doc.getWireByID(wireID).unwrap();
                // TODO[model_refactor_api](leon) - figure out `ev` param
                this.getAssemblerFor(wire.kind).assemble(wire, {});
                continue;
            }
            // Otherwise, wire was deleted so remove it
            this.wireCurves.delete(wireID);
            this.wirePrims.delete(wireID);
        }
        this.dirtyWires.clear();
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

    public getPortPos(portID: GUID): Option<PortPos> {
        if (!this.circuit.doc.hasPort(portID))
            return None();
        const port = this.circuit.doc.getPortByID(portID).unwrap();
        // TODO[model_refactor_api](leon): This is terrible
        if (this.dirtyComponents.has(port.parent)) {
            const comp = this.circuit.doc.getCompByID(port.parent).unwrap();
            this.getAssemblerFor(comp.kind).assemble(comp, {});
            this.dirtyComponents.delete(port.parent);
        }
        return Some(this.portPositions.get(portID)!);
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
        if (!this.renderer.canvas)
            throw new Error("CircuitView: Attempeted Circuit render before a canvas was set!");

        this.updateDirtyObjs();

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
        // Unlock scheduler once a canvas is set
        this.scheduler.setBlocked(false);

        this.renderer.setCanvas(canvas);
    }

    public getCanvas(): HTMLCanvasElement | undefined {
        return this.renderer.canvas;
    }
}
