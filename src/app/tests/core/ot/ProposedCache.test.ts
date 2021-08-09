import "jest"

import { ProposedCache } from "core/ot/ProposedCache";
import { ArrayActionTransformer, ArrayModel, InsertAction } from "./ArrayModel";
import { ProposedEntry } from "core/ot/Protocol";
import { Action, ActionTransformer, OTModel } from "core/ot/Interfaces";

class MockModel implements OTModel {
    public sum: number = 0;
}
class MockActionTransformer implements ActionTransformer<MockModel> {
    Transform(t: Action<MockModel>, f: Action<MockModel>): void { 
        if (t instanceof MockAction && f instanceof MockAction) {
            t.data += f.data;
        }
    }
}
class MockAction implements Action<MockModel> {
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

function mockEntry(n: number, fail: boolean = false): ProposedEntry<MockModel> {
    const e = new ProposedEntry<MockModel>();
    e.Action = new MockAction(n, fail);
    return e;
}

class PC extends ProposedCache<MockModel> {}
describe("ProposedCache", () => {
    const e = mockEntry;
    describe("SendNext", () => {
        test("One", () => {
            const pc = new PC();
            const exp = e(100);
            pc.Push(exp);
            expect(pc.SendNext()).toBe(exp);
        });
        test("Multiple", () => {
            const pc = new PC();
            const exp = e(103);
            pc.Push(exp);
            pc.Push(e(100));
            pc.Push(e(101));
            pc.Push(e(102));
            expect(pc.SendNext()).toBe(exp);
        });
        test("Empty", () => {
            const pc = new ProposedCache<ArrayModel>();
            expect(pc.SendNext()).toBeUndefined();
        });
    });

    describe("PopSent", () => {
        const pc = new PC();
        test("Empty", () => {
            expect(pc.PopSent()).toBeUndefined();
        });
        test("One", () => {
            const exp = e(100);
            pc.Push(exp);
            expect(pc.SendNext()).toBe(exp);
            expect(pc.PopSent()).toBe(exp);
        });
    });

    describe("Revert", () => {
        test("all pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(e(100));
            pc.Push(e(100));
            pc.Revert(m)
            expect(m.sum).toBe(-200);
        });
        test("sent and pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(e(100));
            pc.Push(e(100));
            expect(pc.SendNext()).toBeDefined();
            pc.Revert(m)
            expect(m.sum).toBe(-200);
        });
    });
    describe("TransformApply", () => {
        const xf = new MockActionTransformer();
        test("sent and pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(e(100));
            pc.Push(e(100));
            expect(pc.SendNext()).toBeDefined();
            pc.TransformApply(xf, m, new MockAction(20));
            expect(m.sum).toBe(240);
        });
        test("sent and pending with failure", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(e(100));
            pc.Push(e(100, true));
            expect(pc.SendNext()).toBeDefined();
            pc.TransformApply(xf, m, new MockAction(20));
            expect(m.sum).toBe(120);
            expect(pc.PopSent()).toBeDefined();
            expect(pc.SendNext()).toBeUndefined();
        })
    })
});
