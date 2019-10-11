import "jest";

import {EECircuitDesigner} from "analog/models/AnalogCircuitDesigner";
import {Battery}           from "analog/models/eeobjects/Battery";
import {Resistor}          from "analog/models/eeobjects/Resistor";
import {Node}              from "analog/models/eeobjects/Node";

describe("Node", () => {
    test("Empty Circuit", () => {
        const designer = new EECircuitDesigner();

        const battery   = new Battery(10);
        const resistor  = new Resistor(2);
        const resistor2 = new Resistor(2);

        const node1 = new Node();
        const node2 = new Node();

        Place(designer, [battery, resistor,resistor2,node1,node2]);

        const wire1 = Connect(battery , node1);
        const wire2 = Connect(node1 , resistor);
        const wire3 = Connect(node1 , resistor2);
        const wire4 = Connect(resistor , node2);
        const wire5 = Connect(resistor2 , node2);
        const wire6 = Connect( node2 , battery);

        designer.simulate();

        // Voltage
        expect(node1.getVoltage()).toBe(10);
        expect(node2.getVoltage()).toBe(0);
    });
    test("Empty Circuit", () => {
        const designer = new EECircuitDesigner();

        const battery   = new Battery(10);
        const resistor1 = new Resistor(2);
        const resistor2 = new Resistor(2);
        const resistor3 = new Resistor(2);

        const node1 = new Node();
        const node2 = new Node();

        Place(designer, [battery, resistor1,resistor2,resistor3,node1,node2]);
        const wire1 = Connect(battery , resistor1);
        const wire2 = Connect(resistor1 , node1);
        const wire3 = Connect(node1 , resistor2);
        const wire4 = Connect(node1 , resistor3);
        const wire5 = Connect(resistor2 , node2);
        const wire6 = Connect(resistor3 , node2);
        const wire7 = Connect(node2 , battery);

        designer.simulate();

        //voltage
        expect(node1.getVoltage()).toBe(10/3);
        expect(resistor2.getVoltage()).toBe(10/3);
        expect(resistor3.getVoltage()).toBe(10/3);
    });
});
