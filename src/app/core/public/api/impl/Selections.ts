import {V, Vector}    from "Vector";
import {Component}    from "../Component";
import {Obj}          from "../Obj";
import {Selections}   from "../Selections";
import {Wire}         from "../Wire";
import {CircuitState} from "./CircuitState";


export class SelectionsImpl implements Selections {
    protected state: CircuitState;

    public constructor(state: CircuitState) {
        this.state = state;
    }

    private get selections() {
        return this.state.selectionsManager.get();
    }
    private get doc() {
        return this.state.circuit.doc;
    }

    public get length(): number {
        return this.state.selectionsManager.length();
    }
    public get isEmpty(): boolean {
        return (this.length === 0);
    }

    public get all(): Obj[] {
        return this.selections.map((id) => this.state.getObj(id)!);
    }
    public get components(): Component[] {
        return this.selections.filter((id) => (this.doc.hasComp(id)))
            .map((id) => this.state.constructComponent(id));
    }
    public get wires(): Wire[] {
        return this.selections.filter((id) => (this.doc.hasWire(id)))
            .map((id) => this.state.constructWire(id));
    }

    public midpoint(space: Vector.Spaces): Vector {
        // Case: no components are selected
        if (this.components.length === 0)
            return V(0, 0);

        // Case: One or more components are selected, calculate average
        const avgWorldPos = this.components
            .map((c) => c.pos)
            .reduce((sum, v) => sum.add(v))
            .scale(1 / this.components.length);

        return (space === "screen" ? this.state.view!.toScreenPos(avgWorldPos) : avgWorldPos);
    }

    public clear(): void {
        this.state.selectionsManager.clear();
    }

    public forEach(f: (obj: Obj, i: number, arr: Obj[]) => void): void {
        return this.selections
            .map((id) => this.state.getObj(id)!)
            .forEach(f);
    }
    public every(condition: (obj: Obj, i: number, arr: Obj[]) => boolean): boolean {
        return this.selections
            .map((id) => this.state.getObj(id)!)
            .every(condition);
    }

    public duplicate(): Obj[] {
        if (this.isEmpty)
            return [];
        throw new Error("Unimplemented!");
    }
}
