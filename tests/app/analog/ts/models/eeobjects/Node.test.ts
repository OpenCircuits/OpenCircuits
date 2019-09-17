import "jest";

import {EECircuitDesigner} from "analog/models/EECircuitDesigner";
import {Battery}           from "analog/models/eeobjects/Battery";
import {Resistor}          from "analog/models/eeobjects/Resistor";
import {Node}              from "analog/models/eeobjects/Node";

describe("Node", () => {
    it("Empty Circuit", () => {
        const designer = new EECircuitDesigner();

        const battery   = new Battery(10);
        const resistor  = new Resistor(2);
        const resistor2 = new Resistor(2);

        const node1 = new Node();
        const node2 = new Node();

        designer.addObjects([battery, resistor,resistor2,node1,node2]);

        const wire1 = designer.connect(battery , node1);
        const wire2 = designer.connect(node1 , resistor);
        const wire3 = designer.connect(node1 , resistor2);
        const wire4 = designer.connect(resistor , node2);
        const wire5 = designer.connect(resistor2 , node2);
        const wire6 = designer.connect( node2 , battery);

        designer.simulate();

        // Voltage
        expect(node1.getVoltage()).toBe(10);
        expect(node2.getVoltage()).toBe(0);
    });
    it("Empty Circuit", () => {
        const designer = new EECircuitDesigner();

        const battery   = new Battery(10);
        const resistor1 = new Resistor(2);
        const resistor2 = new Resistor(2);
        const resistor3 = new Resistor(2);

        const node1 = new Node();
        const node2 = new Node();

        designer.addObjects([battery, resistor1,resistor2,resistor3,node1,node2]);
        const wire1 = designer.connect(battery , resistor1);
        const wire2 = designer.connect(resistor1 , node1);
        const wire3 = designer.connect(node1 , resistor2);
        const wire4 = designer.connect(node1 , resistor3);
        const wire5 = designer.connect(resistor2 , node2);
        const wire6 = designer.connect(resistor3 , node2);
        const wire7 = designer.connect(node2 , battery);

        designer.simulate();

        //voltage
        expect(node1.getVoltage()).toBe(10/3);
        expect(resistor2.getVoltage()).toBe(10/3);
        expect(resistor3.getVoltage()).toBe(10/3);
    });
});
