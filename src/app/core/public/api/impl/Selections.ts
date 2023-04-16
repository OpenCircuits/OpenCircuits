import {Component}    from "../Component";
import {Obj}          from "../Obj";
import {Selections}   from "../Selections";
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
        return (this.length > 0);
    }

    public get all(): Obj[] {
        return this.selections.map((id) => this.state.getObj(id)!);
    }
    public get components(): Component[] {
        return this.selections.filter((id) => (this.doc.hasComp(id)))
            .map((id) => this.state.constructComponent(id));
    }

    public clear(): void {
        this.state.selectionsManager.clear();
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
