// @flow

var CircuitDesigner = require("../../../../../../refactor/public/js/models/CircuitDesigner");
var Switch          = require("../../../../../../refactor/public/js/models/ioobjects/inputs/Switch");
var ANDGate         = require("../../../../../../refactor/public/js/models/ioobjects/gates/ANDGate");
var LED             = require("../../../../../../refactor/public/js/models/ioobjects/outputs/LED");

describe("ANDGate", () => {
    designer = new CircuitDesigner();

    var s1 = new Switch();
    var s2 = new Switch();
    var g1 = new ANDGate();
    var l1 = new LED();

    designer.addObjects([s1, s2, g1, l1]);
    designer.connect(s1, 0,  g1, 0);
    designer.connect(s2, 0,  g1, 1);
    designer.connect(g1, 0,  l1, 0);

    it("Initial State", () => {
        expect(l1.isOn()).toBe(false);
    });
    it("Input A On", () => {
        s1.activate(true);
        s2.activate(false);

        expect(l1.isOn()).toBe(false);

        expect(l1.isOn()).toBe(false);
    });
    it("Input B On", () => {
        s1.activate(false);
        s2.activate(true);

        expect(l1.isOn()).toBe(false);
    });
    it("Input A and B On", () => {
        s1.activate(true);
        s2.activate(true);

        expect(l1.isOn()).toBe(true);
    });
});
