import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";
import {Margin}    from "math/Rect";

import {GUID} from "shared/api/circuit/public";

import {CleanupFunc} from "shared/api/circuit/utils/types";
import {MultiObservable} from "shared/api/circuit/utils/Observable";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitState";
import {InputAdapter} from "shared/api/circuitdesigner/input/InputAdapter";
import {Bounds} from "shared/api/circuit/internal/assembly/PrimBounds";

import {RenderHelper}      from "./rendering/RenderHelper";
import {RenderState}       from "./rendering/RenderState";
import {RenderScheduler}   from "./rendering/RenderScheduler";
import {PrimRenderer}      from "./rendering/renderers/PrimRenderer";
import {RenderGrid}        from "./rendering/renderers/GridRenderer";
import {DebugRenderBounds} from "./rendering/renderers/DebugRenderer";

import {Cursor} from "../../input/Cursor";

import {Camera}                                  from "../Camera";
import {CircuitDesigner, CircuitDesignerOptions} from "../CircuitDesigner";
import {Prim, Viewport, ViewportEvents}          from "../Viewport";

import {CameraImpl}                            from "./Camera";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";
import {DebugOptions}                          from "./DebugOptions";
import {IsDefined} from "shared/api/circuit/utils/Reducers";


export class ViewportImpl<T extends CircuitTypes> extends MultiObservable<ViewportEvents> implements Viewport {
    protected readonly state: CircuitDesignerState<T>;
    protected readonly designer: CircuitDesigner<T>;
    // protected readonly svgMap: Map<string, SVGDrawing>;
    protected readonly options: CircuitDesignerOptions;

    protected readonly cameras: Map<CameraRecordKey, Camera> = new Map();
    protected readonly primRenderer: PrimRenderer;
    protected readonly scheduler: RenderScheduler;

    protected curState: {
        mainCanvas: HTMLCanvasElement;
        renderer: RenderHelper;
    } | undefined;

    public constructor(
        state: CircuitDesignerState<T>,
        designer: CircuitDesigner<T>,
        svgMap: Map<string, SVGDrawing>,
        options: CircuitDesignerOptions,
    ) {
        super();

        this.state = state;
        this.designer = designer;
        // this.svgMap = svgMap;
        this.options = options;

        this.cameras = new Map();
        this.primRenderer = new PrimRenderer(svgMap);

        this.scheduler = new RenderScheduler();
        this.scheduler.subscribe(() => this.render());
        this.scheduler.block();

        this.curState = undefined;
    }

    protected render() {
        if (!this.curState)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = this.curState;
        const renderState: RenderState = {
            camera:  this.state.cameras[this.state.curCamera],
            options: this.state.circuitState.renderOptions,
            circuit: this.state.circuitState.internal,
            renderer,
        };
        const renderPrim = (prim: Prim) => {
            // if (!prim.cull(this.camera))
            //     return;
            this.primRenderer.render(renderer.ctx, prim);
        }

        // Reassemble and get the cache
        this.state.circuitState.assembler.reassemble();
        const assembly = this.state.circuitState.assembler.getCache();

        renderer.clear();
        renderer.save();
        {
            // Transform to world-space
            renderer.transform(this.camera.matrix.inverse());

            // Render grid
            if (renderState.options.showGrid)
                RenderGrid(renderState);

            // Render wires
            // TODO[model_refactor](leon) - render by depth
            assembly.wirePrims.forEach((prims) =>
                prims.forEach(renderPrim));

            // Render components
            // TODO[model_refactor](leon) - render by depth
            assembly.componentPrims.forEach((prims, compId) => {
                // Draw ports first
                assembly.portPrims.get(compId)?.forEach((prims) =>
                    prims.forEach(renderPrim));

                // Draw prims for component
                prims.forEach(renderPrim);
            });

            // Debug rendering
            if (this.state.debugOptions.debugPrimBounds) {
                const wireBounds = [...assembly.wirePrims.values()].flat().map(Bounds).filter(IsDefined);
                const compBounds = [...assembly.componentPrims.values()].flat().map(Bounds).filter(IsDefined);
                const portBounds = [...([...assembly.portPrims.values()]
                    .map((m) => [...m.values()]))].flat(2).map(Bounds).filter(IsDefined);

                wireBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#ff5555"));
                portBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#00ff99"));
                compBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#00ff00"));
            }

            if (this.state.debugOptions.debugComponentBounds) {
                this.designer.circuit.getComponents().forEach((comp) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, comp.bounds, "#00ff00"));
            }

            if (this.state.debugOptions.debugWireBounds) {
                this.designer.circuit.getWires().forEach((wire) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, wire.bounds, "#00ff00"));
            }

            if (this.state.debugOptions.debugPortBounds) {
                this.designer.circuit.getComponents().forEach((comp) => {
                    comp.allPorts.forEach((port) =>
                        DebugRenderBounds(this.primRenderer, renderer.ctx, port.bounds, "#00ff00"));
                });
            }

            // Callback for post-rendering
            this.publish("onrender", {
                renderer: {
                    draw:    (prim: Prim) => this.primRenderer.render(renderer.ctx, prim),
                    options: renderState.options,
                },
            });
        }
        renderer.restore();
    }

    public get camera(): Camera {
        if (!this.cameras.has(this.state.curCamera)) {
            const camera = new CameraImpl(this.state, this, this.state.curCamera);
            this.cameras.set(this.state.curCamera, camera);
            camera.subscribe((ev) => {
                if (ev.type === "change")
                    this.scheduler.requestRender();
            });
        }
        return this.cameras.get(this.state.curCamera)!;
    }
    public get screenSize(): Vector {
        return this.curState?.renderer.size ?? V(0, 0);
    }

    public set cursor(cursor: Cursor | undefined) {
        this.state.cursor = cursor;
    }
    public get cursor(): Cursor | undefined {
        return this.state.cursor;
    }

    public set margin(m: Margin) {
        this.state.margin = { ...this.state.margin, ...m };
    }
    public get margin(): Margin {
        return this.state.margin;
    }

    public set debugOptions(val: DebugOptions) {
        this.state.debugOptions = { ...this.state.debugOptions, ...val };
        this.scheduler.requestRender();
    }
    public get debugOptions(): DebugOptions {
        return this.state.debugOptions;
    }

    public resize(w: number, h: number): void {
        // Request a render on resize
        this.scheduler.requestRender();

        this.publish("onresize", { w, h });
    }

    public attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
        if (this.curState)
            throw new Error("Viewport.attachCanvas failed! Should detach the current canvas first!");
        this.curState = {
            mainCanvas: canvas,
            renderer:   new RenderHelper(canvas),
        };

        const u1 = this.state.circuitState.assembler.subscribe((data) => {
            if (data.type === "onchange")
                this.scheduler.requestRender();
        });

        // Setup inputs and forward them to the tool manager
        const inputAdapter = new InputAdapter(canvas, this.options.dragTime);
        const u2 = inputAdapter.subscribe((ev) => this.state.toolManager.onEvent(ev, this.designer));

        let u4: (() => void) | undefined;
        const u3 = this.state.toolManager.subscribe(({ type, tool }) => {
            if (type === "toolactivate") {
                // TODO: Render in another canvas
                u4 = tool.subscribe((_) => this.scheduler.requestRender());
            } else if (type === "tooldeactivate") {
                u4!();
            }
            this.scheduler.requestRender();
        });

        // Unblock scheduler once a canvas is set
        this.scheduler.unblock();

        return () => {
            u4?.();
            u3();
            u2();
            u1();
            this.detachCanvas();
        }
    }
    public detachCanvas(): void {
        this.curState = undefined;
        this.scheduler.block();
    }

    public setView(kind: "main" | "ic", id?: GUID, type?: "internal" | "display"): void {
        if (kind === "main") {
            this.state.curCamera = "main";
        } else if (id && type) {
            this.state.curCamera = `ic/${id}:${type}`;
        } else {
            throw new Error(`Unknown arguments for setView! ${kind}, ${id}, ${type}`);
        }
    }
}
