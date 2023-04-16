import {Observable} from "core/utils/Observable";

import {GUID} from "..";


type SelectionEvent = {
    type: "select" | "deselect";
    selections: GUID[];
}

export class SelectionsManager extends Observable<SelectionEvent> {
    private readonly selections: Set<GUID>;

    public constructor() {
        super();

        this.selections = new Set<GUID>();
    }

    public select(...ids: GUID[]): void {
        // Filter out IDs that are already selected
        const selections = ids.filter((id) => !this.selections.has(id));
        selections.forEach((id) => this.selections.add(id));

        this.publish({ type: "select", selections });
    }

    public deselect(...ids: GUID[]): void {
        // Filter out IDs that are already not selected
        const selections = ids.filter((id) => this.selections.has(id));
        selections.forEach((id) => this.selections.delete(id));

        this.publish({ type: "deselect", selections });
    }

    public has(id: GUID): boolean {
        return this.selections.has(id);
    }

    public get(): GUID[] {
        return [...this.selections];
    }

    public length(): number {
        return this.selections.size;
    }

    public clear(): void {
        // TODO(callac5): See above for reference
        throw new Error("Unimplemented");
    }
}
