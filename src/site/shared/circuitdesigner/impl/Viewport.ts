import {GUID} from "core/public";

import {DefaultTool}  from "shared/tools/DefaultTool";
import {ToolRenderer} from "shared/tools/renderers/ToolRenderer";
import {Tool}         from "shared/tools/Tool";

import {Viewport, ViewportEvents} from "../Viewport";
import {CleanupFunc} from "core/utils/types";
import {CircuitTypes} from "core/public/api/impl/CircuitState";
import {CameraRecordKey, CircuitDesignerState} from "./CircuitDesignerState";
import {Camera} from "../Camera";
import {extend} from "core/utils/Functions";
import {MultiObservableImpl} from "core/public/api/impl/Observable";
import {CameraImpl} from "./Camera";
import {V, Vector} from "Vector";
import {InputAdapter} from "shared/utils/input/InputAdapter";
import {CircuitDesigner} from "../CircuitDesigner";
import {RenderHelper} from "./rendering/RenderHelper";
import {RenderGrid} from "./rendering/renderers/GridRenderer";
import {RenderState} from "./rendering/RenderState";
import {RenderScheduler} from "./rendering/RenderScheduler";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: ToolRenderer[];
}

export function ViewportImpl<T extends CircuitTypes>(state: CircuitDesignerState<T>, designer: CircuitDesigner) {
    const observable = MultiObservableImpl<ViewportEvents>();

    let curState: {
        canvas: HTMLCanvasElement;
        renderer: RenderHelper;
    } | undefined;

    const cameras: Map<CameraRecordKey, Camera> = new Map();

    const dirtyComponents: Set<GUID> = new Set();
    const dirtyWires: Set<GUID> = new Set();

    function getRendererFor(kind: string) {
        return {
            
        }
    }

    const reassemble = () => {
        state.circuitState.assembler.reassemble();

        const circuit = state.circuitState.internal;

        // Update components first
        for (const compID of dirtyComponents) {
            if (!circuit.doc.hasComp(compID))
                continue;
            // Otherwise, update it
            const comp = circuit.doc.getCompByID(compID).unwrap();
            // TODO[model_refactor_api](leon) - figure out `ev` param
            getRendererFor(comp.kind).assemble(comp, {});
        }
        dirtyComponents.clear();

        // Then update wires
        for (const wireID of dirtyWires) {
            if (!circuit.doc.hasWire(wireID))
                continue;
            // Otherwise, update it
            const wire = circuit.doc.getWireByID(wireID).unwrap();
            // TODO[model_refactor_api](leon) - figure out `ev` param
            getRendererFor(wire.kind).assemble(wire, {});
        }
        dirtyWires.clear();
    }

    const render = () => {
        if (!curState)
            throw new Error("Viewport: Attempted Circuit render before a canvas was set!");

        const { renderer } = curState;
        const renderState: RenderState = {
            camera:     state.cameras[state.curCamera],
            options:    state.circuitState.renderOptions,
            circuit:    state.circuitState.internal,
            selections: state.circuitState.selectionsManager,
            renderer,
        };

        // Reassemble and get the cache
        reassemble();
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
                    renderer.draw(prim);
                });
            });

            // Render components
            // TODO[model_refactor](leon) - render by depth
            assembly.componentPrims.forEach((prims, compId) => {
                // Draw ports first
                assembly.portPrims.get(compId)?.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    renderer.draw(prim);
                });

                // Draw prims for component
                prims.forEach((prim) => {
                    // if (!prim.cull(renderState.camera))
                    //     return;
                    renderer.draw(prim);
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

    state.circuitState.selectionsManager.subscribe((ev) => {
        ev.selections.forEach((id) => {
            if (state.circuitState.internal.doc.hasComp(id))
                dirtyComponents.add(id);
            else if (state.circuitState.internal.doc.hasWire(id))
                dirtyWires.add(id);
            else if (state.circuitState.internal.doc.hasPort(id))
                dirtyPorts.add(id);
        });

        scheduler.requestRender();
    });

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
                if (data.type === "onchange") {
                    render();
                }
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
