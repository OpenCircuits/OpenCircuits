import {CreateDrawingFromSVG} from "svg2canvas";

import {Vector} from "Vector";
import {Rect}   from "math/Rect";

import {CleanupFunc} from "core/utils/types";

import {DebugOptions, GUID} from "core/internal";
import {RenderHelper}       from "core/internal/view/rendering/RenderHelper";
import {RenderOptions}      from "core/internal/view/rendering/RenderOptions";

import {Camera}         from "../Camera";
import {Circuit}        from "../Circuit";
import {Selections}     from "../Selections";
import {isObjComponent} from "../Utilities";

import {CameraImpl}                 from "./Camera";
import {CircuitState, CircuitTypes} from "./CircuitState";
import {SelectionsImpl}             from "./Selections";


export function CircuitImpl<CircuitT extends Circuit, T extends CircuitTypes>(state: CircuitState<T>) {
    function pickObjAtHelper(pt: Vector, space: Vector.Spaces = "world", filter?: (id: string) => boolean) {
        const pos = ((space === "world" ? pt : state.view.toWorldPos(pt)));
        return state.view.findNearestObj(pos, filter);
    }

    return {
        beginTransaction(): void {
            state.internal.beginTransaction();
        },
        commitTransaction(): void {
            state.internal.commitTransaction();
        },
        cancelTransaction(): void {
            state.internal.cancelTransaction();
        },

        // Metadata
        get id(): GUID {
            return state.internal.getCircuitMetadata().id;
        },
        set name(val: string) {
            state.internal.setCircuitMetadata({
                ...state.internal.getCircuitMetadata(),
                name: val,
            });
        },
        get name(): string {
            return state.internal.getCircuitMetadata().name;
        },
        set desc(val: string) {
            state.internal.setCircuitMetadata({
                ...state.internal.getCircuitMetadata(),
                desc: val,
            });
        },
        get desc(): string {
            return state.internal.getCircuitMetadata().desc;
        },
        set thumbnail(val: string) {
            state.internal.setCircuitMetadata({
                ...state.internal.getCircuitMetadata(),
                thumb: val,
            });
        },
        get thumbnail(): string {
            return state.internal.getCircuitMetadata().thumb;
        },

        // Other data
        set locked(val: boolean) {
            throw new Error("Unimplemented!");
        },
        get locked(): boolean {
             // TODO: Decide which level to enforce this at.  Is it serialized?
            throw new Error("Unimplemented!");
        },
        set simEnabled(val: boolean) {
            throw new Error("Unimplemented!");
        },
        get simEnabled(): boolean {
            throw new Error("Unimplemented!");
        },
        set debugOptions(val: DebugOptions) {
            throw new Error("Unimplemented!");
        },
        get debugOptions(): DebugOptions {
            throw new Error("Unimplemented!");
        },

        get camera(): Camera {
            return CameraImpl(state);
        },
        get selections(): Selections {
            return SelectionsImpl(this, state);
        },

        // Queries
        pickObjAt(pt: Vector, space: Vector.Spaces = "world"): T["Obj"] | undefined {
            return pickObjAtHelper(pt, space)
                .map((id) => this.getObj(id)).asUnion();
        },
        pickComponentAt(pt: Vector, space: Vector.Spaces = "world"): T["Component"] | undefined {
            return pickObjAtHelper(pt, space, (id) => state.internal.doc.hasComp(id))
                .map((id) => this.getComponent(id)).asUnion();
        },
        pickWireAt(pt: Vector, space: Vector.Spaces = "world"): T["Wire"] | undefined {
            return pickObjAtHelper(pt, space, (id) => state.internal.doc.hasWire(id))
                .map((id) => this.getWire(id)).asUnion();
        },
        pickPortAt(pt: Vector, space: Vector.Spaces = "world"): T["Port"] | undefined {
            return pickObjAtHelper(pt, space, (id) => state.internal.doc.hasPort(id))
                .map((id) => this.getPort(id)).asUnion();
        },
        pickObjRange(bounds: Rect): T["Obj[]"] {
            throw new Error("Unimplemented!");
        },

        getComponent(id: GUID): T["Component"] | undefined {
            if (!state.internal.doc.getCompByID(id))
                return undefined;
            return state.constructComponent(id);
        },
        getWire(id: GUID): T["Wire"] | undefined {
            if (!state.internal.doc.getWireByID(id))
                return undefined;
            return state.constructWire(id);
        },
        getPort(id: GUID): T["Port"] | undefined {
            if (!state.internal.doc.getPortByID(id))
                return undefined;
            return state.constructPort(id);
        },
        getObj(id: GUID): T["Obj"] | undefined {
            if (state.internal.doc.hasComp(id))
                return this.getComponent(id);
            if (state.internal.doc.hasWire(id))
                return this.getWire(id);
            if (state.internal.doc.hasPort(id))
                return this.getPort(id);
            return undefined;
        },
        getObjs(): T["Obj[]"] {
            return [...state.internal.doc.getObjs()]
                .map((id) => this.getObj(id)!);
        },
        getComponents(): T["Component[]"] {
            return this.getObjs().filter(isObjComponent);
        },
        getComponentInfo(kind: string): T["ComponentInfo"] | undefined {
            // TODO[.](kevin) - getComponentInfo should probably return a Result right?
            //                  Or should we add a method to check if a component exists?
            return state.internal.doc.getComponentInfo(kind);
        },

        // Object manipulation
        placeComponentAt(pt: Vector, kind: string): T["Component"] {
            const info = this.getComponentInfo(kind);

            // TODO: Deal with `pt` being in screen space
            this.beginTransaction();

            // Place raw component (TODO: unwrap...)
            const id = state.internal.placeComponent(kind, { x: pt.x, y: pt.y }).unwrap();

            // Set its config to place ports
            state.internal.setPortConfig(id, info!.defaultPortConfig).unwrap();

            this.commitTransaction();

            return state.constructComponent(id);
        },
        deleteObjs(objs: T["Obj[]"]): void {
            throw new Error("Unimplemented!");
        },

        createIC(objs: T["Obj[]"]): CircuitT | undefined {
            throw new Error("Unimplemented!");
        },
        getICs(): CircuitT[] {
            throw new Error("Unimplemented!");
        },

        async loadImages(imgSrcs: string[], onProgress: (pctDone: number) => void): Promise<void> {
            // TODO[model_refactor_api](leon) - Move this somewhere else
            let numLoaded = 0;
            await Promise.all(
                imgSrcs.map(async (src) => {
                    const svg = await fetch(`img/items/${src}`);
                    if (!svg.ok) // Make sure fetch worked
                        throw new Error(`Failed to fetch img/items/${src}: ${svg.statusText}`);

                    const svgXML = new DOMParser().parseFromString(await svg.text(), "text/xml");
                    if (svgXML.querySelector("parsererror")) { // Make sure there's no XML parsing error
                        throw new Error(`Failed to parse XML for img/items/${src}` +
                                        `: ${svgXML.querySelector("parsererror")?.innerHTML}`);
                    }

                    const drawing = CreateDrawingFromSVG(svgXML, {});
                    if (!drawing)
                        throw new Error(`Failed to create drawing for svg: img/items/${src}`);
                    state.view.images.set(src, drawing);

                    // Update progress on successful load
                    onProgress((++numLoaded) / imgSrcs.length);
                })
            );
        },

        undo(): boolean {
            throw new Error("Unimplemented!");
        },
        redo(): boolean {
            throw new Error("Unimplemented!");
        },

        copy(): CircuitT {
            throw new Error("Unimplemented!");
        },

        reset(): void {
            throw new Error("Unimplemented!");
        },

        serialize(objs?: T["Obj[]"]): string {
            throw new Error("Unimplemented!");
        },
        deserialize(data: string): void {
            throw new Error("Unimplemented!");
        },

        resize(w: number, h: number): void {
            state.view.resize(w, h);
        },
        attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
            state.view.setCanvas(canvas);
            return () => this.detachCanvas();
        },
        detachCanvas(): void {
            state.view.setCanvas(undefined);
        },

        forceRedraw(): void {
            state.view.scheduler.requestRender();
        },

        // TODO[](leon) - Need to make a public-facing RenderHelper/RenderOptions
        addRenderCallback(cb: (data: {
            renderer: RenderHelper;
            options: RenderOptions;
            circuit: CircuitT;
        }) => void): CleanupFunc {
            return state.view.subscribe(({ renderer }) => cb({
                renderer,
                options: state.view.options,
                // TODO[model_refactor_api)[leon] - figure out if we can get around this cast?
                circuit: this as CircuitT,
            }));
        },

        subscribe(cb: (ev: any) => void): CleanupFunc {
            throw new Error("Unimplemented!");
        },
    } satisfies Circuit;
}
