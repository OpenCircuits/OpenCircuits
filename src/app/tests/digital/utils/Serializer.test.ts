import {Deserialize, Serialize} from "serialeazy";

import {V} from "Vector";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";


describe("Serialization", () => {
    test("Test 1", () => {
        const d = new DigitalCircuitDesigner(-1);

        const dCopy = Deserialize<DigitalCircuitDesigner>(Serialize(d));

        expect(dCopy.getObjects()).toHaveLength(0);
        expect(dCopy.getWires()).toHaveLength(0);
        expect(dCopy.getICData()).toHaveLength(0);
    });
    test("Test 2", () => {
        const d = new DigitalCircuitDesigner(-1);
        const s = new Switch();
        s.setPos(V(100, -5));
        s.setName("Bob");
        d.addObject(s);

        const dCopy = Deserialize<DigitalCircuitDesigner>(Serialize(d));

        expect(dCopy.getObjects()).toHaveLength(1);
        expect(dCopy.getWires()).toHaveLength(0);
        expect(dCopy.getICData()).toHaveLength(0);

        expect(dCopy.getObjects()[0]).toBeInstanceOf(Switch);
        expect(dCopy.getObjects()[0].getPos().x).toBe(100);
        expect(dCopy.getObjects()[0].getPos().y).toEqual(-5);
        expect(dCopy.getObjects()[0].getName()).toBe("Bob");
    });
});
