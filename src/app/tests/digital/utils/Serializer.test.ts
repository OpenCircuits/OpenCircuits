import {Deserialize, Serialize} from "serialeazy";

import {V} from "Vector";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch} from "digital/models/ioobjects/inputs/Switch";


describe("Serialization", () => {
    test("Test 1", () => {
        const d = new DigitalCircuitDesigner(-1);

        const d_copy = Deserialize<DigitalCircuitDesigner>(Serialize(d));

        expect(d_copy.getObjects()).toHaveLength(0);
        expect(d_copy.getWires()).toHaveLength(0);
        expect(d_copy.getICData()).toHaveLength(0);
    });
    test("Test 2", () => {
        const d = new DigitalCircuitDesigner(-1);
        const s = new Switch();
        s.setPos(V(100, -5));
        s.setName("Bob");
        d.addObject(s);

        const d_copy = Deserialize<DigitalCircuitDesigner>(Serialize(d));

        expect(d_copy.getObjects()).toHaveLength(1);
        expect(d_copy.getWires()).toHaveLength(0);
        expect(d_copy.getICData()).toHaveLength(0);

        expect(d_copy.getObjects()[0]).toBeInstanceOf(Switch);
        expect(d_copy.getObjects()[0].getPos().x).toEqual(100);
        expect(d_copy.getObjects()[0].getPos().y).toEqual(-5);
        expect(d_copy.getObjects()[0].getName()).toEqual("Bob");
    });
});
