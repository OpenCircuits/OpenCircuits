import "jest";

import {Changelog} from "core/ot/Changelog";
import {OTDocument} from "core/ot/OTDocument";
import {PendingCache} from "core/ot/PendingCache";
import {MockClientInfoProvider} from "./MockClientInfoProvider";
import {mockAccEntry, MockAction, MockActionTransformer, MockModel} from "./MockModel";


function newDoc() {
    const m = new MockModel();
    const l = new Changelog<MockModel>();
    const pc = new PendingCache<MockModel>();
    const xf = new MockActionTransformer();
    const doc = new OTDocument<MockModel>(m, l, pc, xf);
    return {
        model: m,
        log: l,
        cache: pc,
        xf: xf,
        doc: doc
    };
}

describe("OTDocument", () => {
    const a = MockAction;
    const e = mockAccEntry;
    describe("Propose", () => {
        test("Success", () => {
            const {doc, model, cache} = newDoc();
            expect(doc.Propose(new a(100))).toBeTruthy();
            expect(model.sum).toBe(100);
        });
        test("Failure", () => {
            const {doc, model} = newDoc();
            expect(doc.Propose(new a(100, true))).toBeFalsy();
            expect(model.sum).toBe(0);
        });
    });

    describe("RecvRemote", () => {
        test("failed action", () => {
            const {doc, model} = newDoc();
            doc.RecvRemote([e(100, 0, true)]);
            expect(model.sum).toBe(0);
        });
        test("single", () => {
            const {doc, model} = newDoc();
            doc.RecvRemote([e(100, 0)]);
            expect(model.sum).toBe(100);
        });
        test("multiple", () => {
            const {doc, model} = newDoc();
            doc.RecvRemote([e(100, 0), e(101, 1), e(102, 2)]);
            expect(model.sum).toBe(303);
        });
        test("multiple with pending", () => {
            const {doc, model, cache} = newDoc();
            expect(doc.Propose(new a(20))).toBe(true);
            expect(doc.Propose(new a(20))).toBe(true);
            doc.RecvRemote([e(100, 0), e(101, 1), e(102, 2)]);
            // Checks that the transformations were successful/expected
            expect(model.sum).toBe(949);
            cache.Revert(model);
            // And undoing the actions leaves us with the remote log state
            expect(model.sum).toBe(303);
        });
    });

    describe("RecvLocal", () => {
        test("expected", () => {
            const {doc, model} = newDoc();
            const x = e(100, 0);
            expect(doc.Propose(x.Action)).toBe(true);
            expect(doc.SendNext()).toBeDefined();
            expect(model.sum).toBe(100);
            doc.RecvLocal(x);
            expect(model.sum).toBe(100);
            expect(doc.Clock()).toBe(1);
        });
    });

    describe("SendNext", () => {
        test("no next", () => {
            const {doc} = newDoc();
            expect(doc.SendNext()).toBeUndefined();
        });
        test("valid next", () => {
            const {doc, log} = newDoc();
            log.Accept(e(0, 0), true, true);

            const x = new a(100);
            expect(doc.Propose(x)).toBe(true);
            const next = doc.SendNext();
            expect(next).toBeDefined();
            expect(next).toBe(x);
            expect(doc.Clock()).toBe(1);
        });
    })
});