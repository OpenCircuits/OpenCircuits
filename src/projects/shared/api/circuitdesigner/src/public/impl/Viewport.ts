import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";
import {Margin, Rect}    from "math/Rect";

import {CleanupFunc} from "shared/api/circuit/utils/types";
import {MultiObservable} from "shared/api/circuit/utils/Observable";
import {CircuitContext, CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {InputAdapter} from "shared/api/circuitdesigner/input/InputAdapter";
import {Bounds, OrientedBounds} from "shared/api/circuit/internal/assembly/PrimBounds";

import {RenderHelper}      from "./rendering/RenderHelper";
import {RenderState}       from "./rendering/RenderState";
import {RenderScheduler}   from "./rendering/RenderScheduler";
import {PrimRenderer}      from "./rendering/renderers/PrimRenderer";
import {RenderGrid}        from "./rendering/renderers/GridRenderer";
import {DebugRenderBounds} from "./rendering/renderers/DebugRenderer";

import {Cursor} from "../../input/Cursor";

import {CircuitDesigner, CircuitDesignerOptions} from "../CircuitDesigner";
import {AttachedCanvasInfo, Prim, RenderOptions, Viewport, ViewportEvents}          from "../Viewport";

import {DebugOptions}                          from "./DebugOptions";
import {IsDefined} from "shared/api/circuit/utils/Reducers";
import {DirtyVar} from "shared/api/circuit/utils/DirtyVar";
import {Matrix2x3} from "math/Matrix";
import {ToolManager} from "./ToolManager";


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
    protected readonly ctx: CircuitContext<T>;
    protected readonly designer: CircuitDesigner<T>;
    protected readonly toolManager: ToolManager<T>;

    protected readonly options: CircuitDesignerOptions;

    protected readonly primRenderer: PrimRenderer;
    protected readonly scheduler: RenderScheduler;

    protected readonly cameraMat: DirtyVar<Matrix2x3>;

    public canvasInfo?: AttachedCanvasInfoImpl;

    protected state: { margin: Margin, debugOptions: DebugOptions };

    public constructor(
        ctx: CircuitContext<T>,
        designer: CircuitDesigner<T>,
        toolManager: ToolManager<T>,
        svgMap: Map<string, SVGDrawing>,
        options: CircuitDesignerOptions,
    ) {
        super();

        this.ctx = ctx;
        this.designer = designer;
        this.toolManager = toolManager;
        this.state = {
            margin:       { left: 0, right: 0, top: 0, bottom: 0 },
            debugOptions: {
                debugPrims:              false,
                debugPrimBounds:         false,
                debugPrimOrientedBounds: false,

                debugComponentBounds: false,
                debugPortBounds:      false,
                debugWireBounds:      false,

                debugPressableBounds: false,
            },
        };

        this.options = options;

        this.primRenderer = new PrimRenderer(svgMap);

        this.scheduler = new RenderScheduler();
        this.scheduler.subscribe(() => this.render());
        this.scheduler.block();

        this.cameraMat = new DirtyVar(() => {
            const { cx, cy, zoom } = this.camera;

            const screenSize = this.canvasInfo?.screenSize ?? V(0, 0);
            return new Matrix2x3(
                V(cx - screenSize.x/2 * zoom, cy - screenSize.y/2 * -zoom),
                0,
                V(zoom, -zoom)
            );
        });

        // Re-render when camera changes
        this.camera.subscribe((ev) => {
            this.cameraMat.setDirty();

            // No canvas attached -> no need to render
            if (!this.canvasInfo)
                return;

            if (ev.type === "change")
                this.scheduler.requestRender();
        });

        // Re-render when assembler changes
        this.ctx.assembler.subscribe((data) => {
            // No canvas attached -> no need to render
            if (!this.canvasInfo)
                return;

            if (data.type === "onchange")
                this.scheduler.requestRender();
        });

        // Re-render when current tool changes state (For tool-renderers)
        let curToolCallbackCleanup: (() => void) | undefined;
        toolManager.subscribe(({ type, tool }) => {
            if (type === "toolActivated") {
                // TODO: Render in another canvas
                curToolCallbackCleanup = tool.subscribe((_) => {
                    // No canvas attached -> no need to render
                    if (!this.canvasInfo)
                        return;

                    this.scheduler.requestRender();
                });
                this.scheduler.requestRender();
            } else if (type === "toolDeactivated") {
                curToolCallbackCleanup!();
                this.scheduler.requestRender();
            }
        });
    }

    protected render() {
        if (!this.canvasInfo)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = this.canvasInfo;
        const renderState: RenderState = {
            options: this.ctx.renderOptions,
            circuit: this.ctx.internal,
            renderer,
        };
        const renderPrim = (prim: Prim) => {
            // if (!prim.cull(this.camera))
            //     return;
            this.primRenderer.render(renderer.ctx, prim, this.debugOptions);
        }

        // Reassemble and get the cache
        this.ctx.assembler.reassemble();
        const assembly = this.ctx.assembler.getCache();

        renderer.clear();
        renderer.save();
        {
            // Transform to world-space
            renderer.transform(this.cameraMat.get().inverse());

            // Render grid
            if (renderState.options.showGrid)
                RenderGrid(renderState);

            // Render wires (by depth)
            assembly.wireOrder.forEach((wireId) =>
                assembly.wirePrims.get(wireId)!.forEach(renderPrim));

            // Render components (by depth)
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
            if (this.debugOptions.debugPrimBounds) {
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
            if (this.debugOptions.debugPrimOrientedBounds) {
                const wireBounds = [...assembly.wirePrims.values()].flat().map(OrientedBounds).filter(IsDefined);
                const compBounds = [...assembly.componentPrims.values()].flat().map(OrientedBounds).filter(IsDefined);
                const portBounds = [...([...assembly.portPrims.values()]
                    .map((m) => [...m.values()]))].flat(2).map(OrientedBounds).filter(IsDefined);

                wireBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#55ff55"));
                portBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#99ff00"));
                compBounds.forEach((b) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, b, "#9803fc"));
            }

            if (this.debugOptions.debugComponentBounds) {
                this.designer.circuit.getComponents().forEach((comp) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, comp.bounds, "#00ff00"));
            }

            if (this.debugOptions.debugWireBounds) {
                this.designer.circuit.getWires().forEach((wire) =>
                    DebugRenderBounds(this.primRenderer, renderer.ctx, wire.bounds, "#00ff00"));
            }

            if (this.debugOptions.debugPortBounds) {
                this.designer.circuit.getComponents().forEach((comp) => {
                    comp.allPorts.forEach((port) =>
                        DebugRenderBounds(this.primRenderer, renderer.ctx, port.bounds, "#00ff00"));
                });
            }
        }
        renderer.restore();

        // Callback for post-rendering
        this.publish("onrender", {
            renderer: {
                draw: (prim: Prim, space = "world") => {
                    renderer.save();
                    if (space === "world")
                        renderer.transform(this.cameraMat.get().inverse());
                    this.primRenderer.render(renderer.ctx, prim);
                    renderer.restore();
                },
                options: renderState.options,
            },
        });
    }

    public get camera() {
        return this.designer.circuit.camera;
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
        if (options.showGrid !== undefined)
            this.ctx.renderOptions.showGrid = options.showGrid;
        this.scheduler.requestRender();
    }

    public resize(w: number, h: number): void {
        // Request a render on resize
        this.scheduler.requestRender();

        this.cameraMat.setDirty();

        this.publish("onresize", { w, h });
    }

    public toWorldPos(screenPos: Vector): Vector {
        return this.cameraMat.get().mul(screenPos);
    }
    public toScreenPos(worldPos: Vector): Vector {
        return this.cameraMat.get().inverse().mul(worldPos);
    }

    public attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
        if (this.canvasInfo)
            throw new Error("Viewport.attachCanvas failed! Should detach the current canvas first!");

        this.canvasInfo = new AttachedCanvasInfoImpl(canvas, this.options.dragTime, (input: InputAdapter) => {
            // Forward inputs to ToolManager
            // TODO: See if we can remove this dependence on the CircuitDesigner
            const u1 = input.subscribe((ev) => this.toolManager.onEvent(ev, this.designer));

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

    public zoomToFit(objs: T["Obj[]"], padRatio?: number): void {
        const canvasInfo = this.getCanvasInfo();
        // If no objects or no canvas return to default zoom
        if (objs.length === 0 || !canvasInfo) {
            this.camera.pos = V();
            this.camera.zoom = 0.02;
            return;
        }

        const { left, right, bottom, top } = { left: 0, right: 0, bottom: 0, top: 0, ...this.margin };

        const marginSize = V(left + right, bottom + top);
        const bbox = Rect.Bounding(objs.map(({ bounds }) => bounds));

        const screenSize = canvasInfo.screenSize.sub(V(marginSize.x, marginSize.y));
        // this.toWorldPos(screenSize) gets a negative number for y which is why we scale by -1, see #1461
        const worldSize = this.toWorldPos(screenSize).sub(this.toWorldPos(V(0, 0))).scale(V(1, -1));

        // Determine which bbox dimension will limit zoom level
        const ratio = V(bbox.width / worldSize.x, bbox.height / worldSize.y);
        const finalZoom = this.camera.zoom * Math.max(ratio.x, ratio.y) * (padRatio ?? 1);

        // Only subtract off 0.5 of the margin offset since currently it's centered on the margin'd
        //  screen size so only half of the margin on the top/left need to be contributed
        const finalPos = bbox.center.sub(marginSize.scale(0.5 * finalZoom));

        this.camera.pos = finalPos;
        this.camera.zoom = finalZoom;
    }
}
