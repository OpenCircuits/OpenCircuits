import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {CircuitInternal}   from "core/internal/impl/CircuitInternal";
import {DebugOptions}      from "core/internal/impl/DebugOptions";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";
import {CircuitView}       from "core/internal/view/CircuitView";

import {Camera}    from "../Camera";
import {Circuit}   from "../Circuit";
import {Component} from "../Component";
import {Obj}       from "../Obj";
import {Port}      from "../Port";
import {Wire}      from "../Wire";

import {CircuitState}         from "./CircuitState";
import {CreateDrawingFromSVG} from "svg2canvas";
import {CameraImpl}           from "./Camera";
import {RenderHelper}         from "core/internal/view/rendering/RenderHelper";
import {RenderOptions}        from "core/internal/view/rendering/RenderOptions";
import {Selections}           from "../Selections";
import {SelectionsImpl}       from "./Selections";
import {CleanupFunc}          from "core/utils/types";
import {isObjComponent}       from "../Utilities";


export abstract class CircuitImpl<
    ComponentT extends Component = Component,
    WireT extends Wire = Wire,
    PortT extends Port = Port,
> implements Circuit, CircuitState<ComponentT, WireT, PortT> {
    public circuit: CircuitInternal;
    public view: CircuitView;

    public selectionsManager: SelectionsManager;

    public isLocked: boolean;

    public constructor(
        circuit: CircuitInternal,
        view: CircuitView,
        selectionsManager: SelectionsManager
    ) {
        this.circuit = circuit;
        this.view = view;

        this.selectionsManager = selectionsManager;

        this.isLocked = false;
    }

    public abstract constructComponent(id: string): ComponentT;
    public abstract constructWire(id: string): WireT;
    public abstract constructPort(id: string): PortT;

    // Transactions.  All ops between a begin/commit pair are applied atomically (For collaborative editing, undo/redo)
    // All queries within a transaction are coherent.
    // All ops outside begin/commit are applied individually
    public beginTransaction(): void {
        this.circuit.beginTransaction();
    }
    public commitTransaction(): void {
        this.circuit.commitTransaction();
    }
    public cancelTransaction(): void {
        this.circuit.cancelTransaction();
    }

    public get id(): string {
        throw new Error("Method not implemented.");
    }

    public set name(val: string) {
        throw new Error("Method not implemented.");
    }
    public get name(): string {
        throw new Error("Method not implemented.");
    }

    public set desc(val: string) {
        throw new Error("Method not implemented.");
    }
    public get desc(): string {
        throw new Error("Method not implemented.");
    }

    public set thumbnail(val: string) {
        throw new Error("Method not implemented.");
    }
    public get thumbnail(): string {
        throw new Error("Method not implemented.");
    }

    public set locked(val: boolean) {
        throw new Error("Unimplemented");
    }
    public get locked(): boolean {
        // TODO: Decide which level to enforce this at.  Is it serialized?
        throw new Error("Unimplemented");
    }

    public set simEnabled(val: boolean) {
        throw new Error("Unimplemented");
    }
    public get simEnabled(): boolean {
        throw new Error("Unimplemented");
    }

    public set debugOptions(options: Partial<DebugOptions>) {
        throw new Error("Unimplemented");
    }
    public get debugOptions(): DebugOptions {
        throw new Error("Unimplemented");
    }

    public get camera(): Camera {
        return new CameraImpl(this);
    }

    // Queries
    private pickObjAtHelper(pt: Vector, space: Vector.Spaces = "world", filter?: (id: string) => boolean) {
        const pos = ((space === "world" ? pt : this.view.toWorldPos(pt)));
        return this.view.findNearestObj(pos, filter);
    }
    public pickObjAt(pt: Vector, space: Vector.Spaces = "world"): ComponentT | WireT | PortT | undefined {
        return this.pickObjAtHelper(pt, space)
            .map((id) => this.getObj(id)).asUnion();
    }
    public pickComponentAt(pt: Vector, space: Vector.Spaces = "world"): ComponentT | undefined {
        return this.pickObjAtHelper(pt, space, (id) => this.circuit.doc.hasComp(id))
            .map((id) => this.getComponent(id)).asUnion();
    }
    public pickWireAt(pt: Vector, space: Vector.Spaces = "world"): WireT | undefined {
        return this.pickObjAtHelper(pt, space, (id) => this.circuit.doc.hasWire(id))
            .map((id) => this.getWire(id)).asUnion();
    }
    public pickPortAt(pt: Vector, space: Vector.Spaces = "world"): PortT | undefined {
        return this.pickObjAtHelper(pt, space, (id) => this.circuit.doc.hasPort(id))
            .map((id) => this.getPort(id)).asUnion();
    }
    public pickObjRange(bounds: Rect): Array<ComponentT | WireT | PortT> {
        throw new Error("Unimplemented");
    }

    public get selections(): Selections {
        return new SelectionsImpl(this);
    }

    public getComponent(id: string): ComponentT | undefined {
        if (!this.circuit.doc.getCompByID(id))
            return undefined;
        return this.constructComponent(id);
    }
    public getWire(id: string): WireT | undefined {
        if (!this.circuit.doc.getWireByID(id))
            return undefined;
        return this.constructWire(id);
    }
    public getPort(id: string): PortT | undefined {
        if (!this.circuit.doc.getPortByID(id))
            return undefined;
        return this.constructPort(id);
    }
    public getObj(id: string): ComponentT | WireT | PortT | undefined {
        if (this.circuit.doc.hasComp(id))
            return this.getComponent(id);
        if (this.circuit.doc.hasWire(id))
            return this.getWire(id);
        if (this.circuit.doc.hasPort(id))
            return this.getPort(id);
        return undefined;
    }
    public getObjs(): Obj[] {
        return [...this.circuit.doc.getObjs()]
            .map((id) => this.getObj(id)!);
    }
    public getComponents(): Component[] {
        return this.getObjs().filter(isObjComponent);
    }
    public getComponentInfo(kind: string): ComponentT["info"] | undefined {
        throw new Error("Method not implemented.");
    }

    public selectionsMidpoint(space: Vector.Spaces): Vector {
        const allComponents = this.selectionsManager.get()
            .map((id) => this.getComponent(id))
            .filter((comp) => (comp !== undefined)) as Component[];

        // Case: no components are selected
        if (allComponents.length === 0)
            return V(0,0)

        // Case: One or more components are selected
        const sumPosition = allComponents
                            .map((c) => c.pos)
                            .reduce((sum, v) => sum.add(v));

        // Calculate average position
        return sumPosition.scale(1 / allComponents.length);
    }

    // Object manipulation
    public placeComponentAt(pt: Vector, kind: string): ComponentT {
        const info = this.circuit.doc.getComponentInfo(kind);

        // TODO: Deal with `pt` being in screen space
        this.circuit.beginTransaction();

        // Place raw component (TODO: unwrap...)
        const id = this.circuit.placeComponent(kind, { x: pt.x, y: pt.y }).unwrap();

        // Set its config to place ports
        this.circuit.setPortConfig(id, info.defaultPortConfig).unwrap();

        this.circuit.commitTransaction();

        return this.constructComponent(id);
    }
    // Wire connection can fail if i.e. p1 is reference-equal to p2
    public abstract connectWire(p1: PortT, p2: PortT): WireT | undefined;

    public deleteObjs(objs: Array<ComponentT | WireT | PortT>): void {
        // TODO(friedj)
        //  See `placeComponentAt` for some general guidance
        //  Note that to delete a Component, you have to set its "Port Config" to `{}` first
        //   which will remove all of its ports
        //  Then it's safe to delete the Component directly
        //  And also note that deleting Ports is a no-op, just ignore that case
        throw new Error("Unimplemented");
    }
    public clearSelections(): void {
        this.selections.clear();
    }

    public createIC(objs: Array<ComponentT | WireT | PortT>): Circuit | undefined {
        throw new Error("Unimplemented");
    }
    public getICs(): Circuit[] {
        throw new Error("Method not implemented.");
    }

    public async loadImages(imgSrcs: string[], onProgress: (pctDone: number) => void): Promise<void> {
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
                this.view.addImage(src, drawing);

                // Update progress on successful load
                onProgress((++numLoaded) / imgSrcs.length);
            })
        );
    }

    public undo(): boolean {
        throw new Error("Unimplemented");
    }
    public redo(): boolean {
        throw new Error("Unimplemented");
    }

    public copy(): Circuit {
        throw new Error("Method not implemented.");
    }

    public reset(): void {
        throw new Error("Method not implemented.");
    }

    public serialize(): string {
        throw new Error("Method not implemented.");
    }
    public deserialize(data: string): void {
        throw new Error("Method not implemented.");
    }

    public resize(w: number, h: number): void {
        this.view.resize(w, h);
    }
    public get canvas() {
        return this.view.getCanvas();
    }
    public attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
        this.view.setCanvas(canvas);
        return () => this.detachCanvas();
    }
    public detachCanvas(): void {
        this.view.setCanvas(undefined);
    }

    public forceRedraw(): void {
        this.view.scheduler.requestRender();
    }

    public addRenderCallback(cb: (data: {
        renderer: RenderHelper; options: RenderOptions; circuit: Circuit;
    }) => void): CleanupFunc {
        return this.view.subscribe(({ renderer }) => cb({ renderer, options: this.view.options, circuit: this }));
    }

    public subscribe(cb: (ev: any) => void): CleanupFunc {
        throw new Error("Method not implemented.");
    }
}
