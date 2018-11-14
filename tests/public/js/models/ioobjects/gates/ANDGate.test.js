// @flow

var CircuitDesigner = require("../../../../../../refactor/public/js/models/CircuitDesigner");
var Switch          = require("../../../../../../refactor/public/js/models/ioobjects/inputs/Switch");
var ANDGate         = require("../../../../../../refactor/public/js/models/ioobjects/gates/ANDGate");
var LED             = require("../../../../../../refactor/public/js/models/ioobjects/outputs/LED");

describe("ANDGate", () => {
    describe("ANDGate", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), b = new Switch(), g = new ANDGate(), o = new LED();

        designer.addObjects([a, b, g, o]);
        designer.connect(a, 0,  g, 0);
        designer.connect(b, 0,  g, 1);
        designer.connect(g, 0,  o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        it("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        it("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        it("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
        it("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("NANDGate", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch(), b = new Switch(), g = new ANDGate(true), o = new LED();

        designer.addObjects([a, b, g, o]);
        designer.connect(a, 0,  g, 0);
        designer.connect(b, 0,  g, 1);
        designer.connect(g, 0,  o, 0);

        it("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        it("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        it("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        it("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
        it("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
    });
});
