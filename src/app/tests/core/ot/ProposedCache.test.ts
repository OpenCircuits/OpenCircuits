import "jest";

import {PendingCache} from "core/ot/PendingCache";
import {MockAction, MockActionTransformer, MockModel} from "./MockModel";


class PC extends PendingCache<MockModel> { }
describe("ProposedCache", () => {
    const a = MockAction;
    describe("Push", () => {
        test("Success", () => {
            const m = new MockModel();
            const pc = new PC();
            const exp = new a(100);
            pc.Push(m, exp);
            expect(m.sum).toBe(100);
        });
        test("Failure", () => {
            const m = new MockModel();
            const pc = new PC();
            const exp = new a(100, true);
            pc.Push(m, exp);
            expect(m.sum).toBe(0);
        });
    });

    describe("SendNext", () => {
        test("One", () => {
            const m = new MockModel();
            const pc = new PC();
            const exp = new a(100);
            pc.Push(m, exp);
            expect(pc.SendNext()).toBe(exp);
        });
        test("Multiple", () => {
            const m = new MockModel();
            const pc = new PC();
            const exp = new a(103);
            pc.Push(m, exp);
            pc.Push(m, new a(100));
            pc.Push(m, new a(101));
            pc.Push(m, new a(102));
            expect(pc.SendNext()).toBe(exp);
        });
        test("Empty", () => {
            const pc = new PC();
            expect(pc.SendNext()).toBeUndefined();
        });
    });

    describe("PopSent", () => {
        const pc = new PC();
        test("Empty", () => {
            expect(pc.PopSent()).toBeUndefined();
        });
        test("One", () => {
            const m = new MockModel();
            const exp = new a(100);
            pc.Push(m, exp);
            expect(pc.SendNext()).toBe(exp);
            expect(pc.PopSent()).toBeTruthy();
        });
    });

    describe("Revert", () => {
        test("all pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(m, new a(100));
            pc.Push(m, new a(100));
            pc.Revert(m)
            expect(m.sum).toBe(0);
        });
        test("sent and pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(m, new a(100));
            pc.Push(m, new a(100));
            expect(pc.SendNext()).toBeDefined();
            pc.Revert(m)
            expect(m.sum).toBe(0);
        });
    });
    describe("TransformApply", () => {
        const xf = new MockActionTransformer();
        test("sent and pending", () => {
            const m = new MockModel();
            const pc = new PC();
            pc.Push(m, new a(100));
            pc.Push(m, new a(100));
            expect(pc.SendNext()).toBeDefined();
            pc.TransformApply(xf, m, [new MockAction(20)]);
            expect(m.sum).toBe(440);
        });
        test("sent and pending with failure", () => {
            const m = new MockModel();
            const pc = new PC();
            const bad = new a(100);
            pc.Push(m, new a(100));
            pc.Push(m, bad);
            expect(pc.SendNext()).toBeDefined();

            // Invoke a failure after initial application, so its in the pending list
            bad.fail = true;
            pc.TransformApply(xf, m, [new MockAction(20)]);
            expect(m.sum).toBe(320);
            expect(pc.PopSent()).toBeDefined();
            expect(pc.SendNext()).toBeUndefined();
        })
    })
});
