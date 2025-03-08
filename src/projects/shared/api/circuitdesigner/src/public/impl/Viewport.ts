import {SVGDrawing} from "svg2canvas";

import {V, Vector} from "Vector";
import {Margin}    from "math/Rect";

import {GUID} from "shared/api/circuit/public";

import {CleanupFunc} from "shared/api/circuit/utils/types";
import {extend}      from "shared/api/circuit/utils/Functions";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {CircuitTypes}        from "shared/api/circuit/public/impl/CircuitState";
import {MultiObservableImpl} from "shared/api/circuit/public/impl/Observable";

import {InputAdapter} from "shared/api/circuitdesigner/input/InputAdapter";

import {RenderHelper}             from "./rendering/RenderHelper";
import {RenderState}              from "./rendering/RenderState";
import {RenderScheduler}          from "./rendering/RenderScheduler";
import {PrimRenderer}             from "./rendering/renderers/PrimRenderer";
import {RenderGrid}               from "./rendering/renderers/GridRenderer";

import {Cursor} from "../../input/Cursor";

import {Camera}                                  from "../Camera";
import {CircuitDesigner, CircuitDesignerOptions} from "../CircuitDesigner";
import {Prim, Viewport, ViewportEvents}                from "../Viewport";

import {CameraImpl}                            from "./Camera";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";
import {DebugOptions} from "./DebugOptions";
import {Bounds} from "shared/api/circuit/internal/assembly/PrimBounds";
import {DebugRenderBounds} from "./rendering/renderers/DebugRenderer";


export function ViewportImpl<T extends CircuitTypes>(
    state: CircuitDesignerState<T>,
    designer: CircuitDesigner,
    svgMap: Map<string, SVGDrawing>,
    options: CircuitDesignerOptions,
) {
    const observable = MultiObservableImpl<ViewportEvents>();

    let curState: {
        mainCanvas: HTMLCanvasElement;
        renderer: RenderHelper;
    } | undefined;

    const cameras: Map<CameraRecordKey, Camera> = new Map();

    const renderOptions = new DefaultRenderOptions();

    const primRenderer = new PrimRenderer(svgMap);
    const render = () => {
        if (!curState)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = curState;
        const renderState: RenderState = {
            camera:  state.cameras[state.curCamera],
            options: renderOptions,
            circuit: state.circuitState.internal,
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
                    primRenderer.render(renderer.ctx, prim);
                });
            });

            // Render components
            // TODO[model_refactor](leon) - render by depth
            assembly.componentPrims.forEach((prims, compId) => {
                // Draw ports first
                assembly.portPrims.get(compId)?.forEach((prims) => {
                    prims.forEach((prim) => {
                        // if (!prim.cull(renderState.camera))
                        //     return;
                        primRenderer.render(renderer.ctx, prim);
                    });
                });

                // Draw prims for component
                prims.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    primRenderer.render(renderer.ctx, prim);
                });
            });

            // Debug rendering
            if (state.debugOptions.debugPrimBounds) {
                const wireBounds = [...assembly.wirePrims.values()].flat().map(Bounds);
                const compBounds = [...assembly.componentPrims.values()].flat().map(Bounds);
                const portBounds =
                    [...([...assembly.portPrims.values()].map((m) => [...m.values()]))].flat(2).map(Bounds);

                wireBounds.forEach((b) =>
                    DebugRenderBounds(primRenderer, renderer.ctx, b, "#ff5555"));
                portBounds.forEach((b) =>
                    DebugRenderBounds(primRenderer, renderer.ctx, b, "#00ff99"));
                compBounds.forEach((b) =>
                    DebugRenderBounds(primRenderer, renderer.ctx, b, "#00ff00"));
            }

            if (state.debugOptions.debugComponentBounds) {
                designer.circuit.getComponents().forEach((comp) =>
                    DebugRenderBounds(primRenderer, renderer.ctx, comp.bounds, "#00ff00"));
            }

            if (state.debugOptions.debugWireBounds) {
                designer.circuit.getWires().forEach((wire) =>
                    DebugRenderBounds(primRenderer, renderer.ctx, wire.bounds, "#00ff00"));
            }

            if (state.debugOptions.debugPortBounds) {
                designer.circuit.getComponents().forEach((comp) => {
                    comp.allPorts.forEach((port) =>
                        DebugRenderBounds(primRenderer, renderer.ctx, port.bounds, "#00ff00"));
                });
            }

            // Callback for post-rendering
            view.emit("onrender", {
                renderer: {
                    draw:    (prim: Prim) => primRenderer.render(renderer.ctx, prim),
                    options: renderState.options,
                },
            });
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

        set cursor(cursor: Cursor | undefined) {
            state.cursor = cursor;
        },
        get cursor(): Cursor | undefined {
            return state.cursor;
        },

        set margin(m: Margin) {
            state.margin = { ...state.margin, ...m };
        },
        get margin(): Margin {
            return state.margin;
        },

        set debugOptions(val: DebugOptions) {
            state.debugOptions = { ...state.debugOptions, ...val };
            scheduler.requestRender();
        },
        get debugOptions(): DebugOptions {
            return state.debugOptions;
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
                mainCanvas: canvas,
                renderer:   new RenderHelper(canvas),
            };

            const u1 = state.circuitState.assembler.subscribe((data) => {
                if (data.type === "onchange")
                    scheduler.requestRender();
            });

            // Setup inputs and forward them to the tool manager
            const inputAdapter = new InputAdapter(canvas, options.dragTime);
            const u2 = inputAdapter.subscribe((ev) => state.toolManager.onEvent(ev, designer));

            let u4: (() => void) | undefined;
            const u3 = state.toolManager.subscribe(({ type, tool }) => {
                if (type === "toolactivate") {
                    // TODO: Render in another canvas
                    u4 = tool.subscribe((_) => scheduler.requestRender());
                } else if (type === "tooldeactivate") {
                    u4!();
                }
                scheduler.requestRender();
            });

            // Unblock scheduler once a canvas is set
            scheduler.unblock();

            return () => {
                u4?.();
                u3();
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
