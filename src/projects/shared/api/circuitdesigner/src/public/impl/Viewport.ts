import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";
import {Margin}    from "math/Rect";

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
import {AttachedCanvasInfo, Prim, RenderOptions, Viewport, ViewportEvents}          from "../Viewport";

import {CameraImpl}                            from "./Camera";
import {CircuitDesignerState} from "./CircuitDesignerState";
import {DebugOptions}                          from "./DebugOptions";
import {IsDefined} from "shared/api/circuit/utils/Reducers";


export class AttachedCanvasInfoImpl implements AttachedCanvasInfo {
    public readonly canvas: HTMLCanvasElement;
    public readonly input: InputAdapter;

    public renderer: RenderHelper;

    private readonly cleanupFunc: CleanupFunc;

    public constructor(
        canvas: HTMLCanvasElement,
        dragTime: number | undefined,
        callback: (input: InputAdapter) => CleanupFunc,
    ) {
        this.canvas = canvas;
        this.input = new InputAdapter(canvas, dragTime);
        this.renderer = new RenderHelper(canvas);

        this.cleanupFunc = callback(this.input);
    }

    public get screenSize(): Vector {
        return this.renderer.size ?? V(0, 0);
    }

    public set cursor(cursor: Cursor | undefined) {
        this.canvas.style.cursor = cursor ?? "";
    }
    public get cursor(): Cursor | undefined {
        const cursor = this.canvas.style.cursor;
        return (cursor === "" ? undefined : cursor as Cursor);
    }

    public detach(): void {
        this.input.block();
        this.cleanupFunc();
    }
}

export class ViewportImpl<T extends CircuitTypes> extends MultiObservable<ViewportEvents> implements Viewport {
    public readonly camera: Camera;

    protected readonly state: CircuitDesignerState<T>;
    protected readonly designer: CircuitDesigner<T>;
    // protected readonly svgMap: Map<string, SVGDrawing>;
    protected readonly options: CircuitDesignerOptions;

    protected readonly primRenderer: PrimRenderer;
    protected readonly scheduler: RenderScheduler;

    public canvasInfo?: AttachedCanvasInfoImpl;

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

        this.camera = new CameraImpl(this.state, this);
        this.primRenderer = new PrimRenderer(svgMap);

        this.scheduler = new RenderScheduler();
        this.scheduler.subscribe(() => this.render());
        this.scheduler.block();

        // Re-render when camera changes
        this.camera.subscribe((ev) => {
            // No canvas attached -> no need to render
            if (!this.canvasInfo)
                return;

            if (ev.type === "change")
                this.scheduler.requestRender();
        });

        // Re-render when assembler changes
        this.state.circuitState.assembler.subscribe((data) => {
            // No canvas attached -> no need to render
            if (!this.canvasInfo)
                return;

            if (data.type === "onchange")
                this.scheduler.requestRender();
        });

        // Re-render when current tool changes state (For tool-renderers)
        let curToolCallbackCleanup: (() => void) | undefined;
        this.state.toolManager.subscribe(({ type, tool }) => {
            if (type === "toolactivate") {
                // TODO: Render in another canvas
                curToolCallbackCleanup = tool.subscribe((_) => {
                    // No canvas attached -> no need to render
                    if (!this.canvasInfo)
                        return;

                    this.scheduler.requestRender();
                });
            } else if (type === "tooldeactivate") {
                curToolCallbackCleanup!();
            }
            this.scheduler.requestRender();
        });
    }

    protected render() {
        if (!this.canvasInfo)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = this.canvasInfo;
        const renderState: RenderState = {
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
            assembly.componentOrder.forEach((compId) => {
                const prims = assembly.componentPrims.get(compId)!;

                // Draw ports first
                assembly.portPrims.get(compId)?.forEach((prims) =>
                    prims.forEach(renderPrim));

                // Draw prims for component
                prims.forEach(renderPrim);

                // Draw port labels afterwards
                assembly.portLabelPrims.get(compId)?.forEach(renderPrim);
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
    public setRenderOptions(options: Partial<Pick<RenderOptions, "showGrid">>): void {
        this.state.circuitState.renderOptions = { ...this.state.circuitState.renderOptions, ...options };
        this.scheduler.requestRender();
    }

    public resize(w: number, h: number): void {
        // Request a render on resize
        this.scheduler.requestRender();

        this.publish("onresize", { w, h });
    }

    public attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
        if (this.canvasInfo)
            throw new Error("Viewport.attachCanvas failed! Should detach the current canvas first!");

        this.canvasInfo = new AttachedCanvasInfoImpl(canvas, this.options.dragTime, (input: InputAdapter) => {
            // Forward inputs to ToolManager
            const u1 = input.subscribe((ev) => this.state.toolManager.onEvent(ev, this.designer));

            // Unblock scheduler once a canvas is set
            this.scheduler.unblock();

            this.scheduler.requestRender();

            return () => {
                u1();
                this.scheduler.block();
                this.canvasInfo = undefined;
            }
        });

        return () => this.canvasInfo?.detach();
    }
    public getCanvasInfo(): AttachedCanvasInfo | undefined {
        return this.canvasInfo;
    }
}
