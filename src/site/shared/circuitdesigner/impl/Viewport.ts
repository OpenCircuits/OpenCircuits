import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";

import {GUID} from "core/public";

import {CleanupFunc} from "core/utils/types";
import {extend}      from "core/utils/Functions";

import {DefaultRenderOptions} from "core/internal/assembly/RenderOptions";

import {CircuitTypes}        from "core/public/api/impl/CircuitState";
import {MultiObservableImpl} from "core/public/api/impl/Observable";

import {DefaultTool}  from "shared/tools/DefaultTool";
import {ToolRenderer} from "shared/tools/renderers/ToolRenderer";
import {Tool}         from "shared/tools/Tool";

import {InputAdapter} from "shared/utils/input/InputAdapter";

import {RenderHelper}             from "./rendering/RenderHelper";
import {RenderState}              from "./rendering/RenderState";
import {RenderScheduler}          from "./rendering/RenderScheduler";
import {PrimRenderer}             from "./rendering/renderers/PrimRenderer";
import {RenderGrid}               from "./rendering/renderers/GridRenderer";
import {BezierCurvePrimRenderer}  from "./rendering/renderers/prims/BezierCurvePrimRenderer";
import {CirclePrimRenderer}       from "./rendering/renderers/prims/CirclePrimRenderer";
import {CircleSectorPrimRenderer} from "./rendering/renderers/prims/CircleSectorPrimRenderer";
import {LinePrimRenderer}         from "./rendering/renderers/prims/LinePrimRenderer";
import {PolygonPrimRenderer}      from "./rendering/renderers/prims/PolygonPrimRenderer";
import {QuadCurvePrimRenderer}    from "./rendering/renderers/prims/QuadCurvePrimRenderer";
import {RectanglePrimRenderer}    from "./rendering/renderers/prims/RectanglePrimRenderer";
import {SVGPrimRenderer}          from "./rendering/renderers/prims/SVGPrimRenderer";

import {Camera}                   from "../Camera";
import {CircuitDesigner}          from "../CircuitDesigner";
import {Viewport, ViewportEvents} from "../Viewport";

import {CameraImpl}                            from "./Camera";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: ToolRenderer[];
}

export function ViewportImpl<T extends CircuitTypes>(
    state: CircuitDesignerState<T>,
    designer: CircuitDesigner,
    svgMap: Map<string, SVGDrawing>,
) {
    const observable = MultiObservableImpl<ViewportEvents>();

    let curState: {
        canvas: HTMLCanvasElement;
        renderer: RenderHelper;
    } | undefined;

    const cameras: Map<CameraRecordKey, Camera> = new Map();

    const renderOptions = new DefaultRenderOptions();

    const primRenderers = {
        "BezierCurve":  new BezierCurvePrimRenderer({}),
        "Circle":       new CirclePrimRenderer({}),
        "CircleSector": new CircleSectorPrimRenderer({}),
        "Line":         new LinePrimRenderer({}),
        "Polygon":      new PolygonPrimRenderer({}),
        "QuadCurve":    new QuadCurvePrimRenderer({}),
        "Rectangle":    new RectanglePrimRenderer({}),
        "SVG":          new SVGPrimRenderer(svgMap),
    } as const;
    function getRendererFor(kind: string): PrimRenderer {
        if (!(kind in primRenderers))
            throw new Error(`Unknown prim renderer for kind: ${kind}`);
        return primRenderers[kind as keyof typeof primRenderers];
    }

    const render = () => {
        if (!curState)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = curState;
        const renderState: RenderState = {
            camera:     state.cameras[state.curCamera],
            options:    renderOptions,
            circuit:    state.circuitState.internal,
            selections: state.circuitState.selectionsManager,
            renderer,
        };

        // Reassemble and get the cache
        state.circuitState.assembler.reassemble();
        const assembly = state.circuitState.assembler.getCache();

        renderer.clear();
        renderer.save();
        {
            // Transform to world-space
            renderer.transform(view.camera.matrix.inverse());

            // Render grid
            if (renderState.options.showGrid)
                RenderGrid(renderState);

            // Render wires
            // TODO[model_refactor](leon) - render by depth
            assembly.wirePrims.forEach((prims) => {
                prims.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    // renderer.draw(prim);
                    getRendererFor(prim.kind)
                        .render(renderer.ctx, prim);
                });
            });

            // Render components
            // TODO[model_refactor](leon) - render by depth
            assembly.componentPrims.forEach((prims, compId) => {
                // Draw ports first
                assembly.portPrims.get(compId)?.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    // renderer.draw(prim);
                    getRendererFor(prim.kind)
                        .render(renderer.ctx, prim);
                });

                // Draw prims for component
                prims.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    // renderer.draw(prim);
                    getRendererFor(prim.kind)
                        .render(renderer.ctx, prim);
                });
            });

            // Debug rendering

            // Callback for post-rendering
            view.emit("onrender", { renderer });
        }
        renderer.restore();
    }

    const scheduler = new RenderScheduler();
    scheduler.subscribe(render);
    scheduler.block();

    const view = extend(observable, {
        get camera(): Camera {
            if (!cameras.has(state.curCamera)) {
                const camera = CameraImpl(state.curCamera, state, view);
                cameras.set(state.curCamera, camera);
                camera.observe((ev) => {
                    if (ev.type === "change")
                        scheduler.requestRender();
                });
            }
            return cameras.get(state.curCamera)!;
        },
        get screenSize(): Vector {
            if (!curState)
                return V(0, 0);
            return curState.renderer.size;
        },

        resize(w: number, h: number): void {
            // Request a render on resize
            scheduler.requestRender();

            view.emit("onresize", { w, h });
        },

        attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
            if (curState)
                throw new Error("Viewport.attachCanvas failed! Should detach the current canvas first!");
            curState = {
                canvas,
                renderer: new RenderHelper(canvas),
            };

            const u1 = state.circuitState.assembler.subscribe((data) => {
                if (data.type === "onchange")
                    scheduler.requestRender();
            });

            // Setup inputs and forward them to the tool manager
            const inputAdapter = new InputAdapter(canvas);
            const u2 = inputAdapter.subscribe((ev) => state.toolManager.onEvent(ev, designer));

            // Unblock scheduler once a canvas is set
            scheduler.unblock();

            return () => {
                u2();
                u1();
                view.detachCanvas();
            }
        },
        detachCanvas(): void {
            curState = undefined;
            scheduler.block();
        },

        setView(kind: "main" | "ic", id?: GUID, type?: "internal" | "display"): void {
            if (kind === "main") {
                state.curCamera = "main";
            } else if (id && type) {
                state.curCamera = `ic/${id}:${type}`;
            } else {
                throw new Error(`Unknown arguments for setView! ${kind}, ${id}, ${type}`);
            }
        },
    }) satisfies Viewport;

    return view;
}
