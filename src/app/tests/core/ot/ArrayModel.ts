import { Action, ActionTransformer, OTModel } from "core/ot/Interfaces";

export class ArrayModel implements OTModel {
    public Elements: number[] = new Array<number>();
}

export type ArrayAction = Action<ArrayModel>;

export class InsertAction implements ArrayAction {
    public pos: number;
    public value: number;

    public constructor(pos: number, value: number) {
        this.pos = pos;
        this.value = value;
    }

    Inverse(): Action<ArrayModel> {
        return new DeleteAction(this.pos, this.value);
    }
    Apply(m: ArrayModel): boolean {
        if (m.Elements.length < this.pos) {
            return false;
        }
        m.Elements[this.pos] = this.value;
        return true;
    }
}

export class DeleteAction implements ArrayAction {
    public pos: number;
    public tombstone?: number;

    public constructor(pos: number, tombstone?: number) {
        this.pos = pos;
        this.tombstone = tombstone;
    }

    Inverse(): Action<ArrayModel> {
        if (this.tombstone == undefined) {
            throw new Error("Cannot invert delete without tombstone");
        }
        return new InsertAction(this.pos, this.tombstone);
    }

    Apply(m: ArrayModel): boolean {
        // Check preconditions before applying
        if (m.Elements.length <= this.pos) {
            return false;
        }
        this.tombstone = m.Elements.splice(this.pos, 1)[0];
        return true;
    }
}

export class ArrayActionTransformer implements ActionTransformer<ArrayModel> {
    Transform(t: ArrayAction, f: ArrayAction): void {
        if (t instanceof InsertAction || t instanceof DeleteAction) {
            if (f instanceof InsertAction) {
                if (f.pos < t.pos) {
                    t.pos++;
                }
            } else if (f instanceof DeleteAction) {
                if (f.pos < t.pos) {
                    t.pos--;
                }
            }
        }
    }
}