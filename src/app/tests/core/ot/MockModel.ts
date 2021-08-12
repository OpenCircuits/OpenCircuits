import { Action, ActionTransformer, OTModel } from "core/ot/Interfaces";
import { AcceptedEntry, ProposedEntry } from "core/ot/Protocol";


export class MockModel implements OTModel {
    public sum: number = 0;
}
export class MockActionTransformer implements ActionTransformer<MockModel> {
    Transform(t: Action<MockModel>, f: Action<MockModel>): void {
        if (t instanceof MockAction && f instanceof MockAction) {
            t.data += f.data;
        }
    }
}
export class MockAction implements Action<MockModel> {
    public data: number;
    public fail: boolean;
    public constructor(data: number, fail: boolean = false) {
        this.data = data;
        this.fail = fail;
    }
    Inverse(): Action<MockModel> {
        return new MockAction(-this.data);
    }
    Apply(m: MockModel): boolean {
        if (this.fail) {
            return false;
        }
        m.sum += this.data;
        return true;
    }
}

export function mockEntry(n: number, fail: boolean = false): ProposedEntry<MockModel> {
    const e = new ProposedEntry<MockModel>();
    e.Action = new MockAction(n, fail);
    return e;
}
export function mockAccEntry(n: number, clock: number, fail: boolean = false): AcceptedEntry<MockModel> {
    const e = new AcceptedEntry<MockModel>();
    e.AcceptedClock = e.ProposedClock = clock;
    e.Action = new MockAction(n, fail);
    return e;
}