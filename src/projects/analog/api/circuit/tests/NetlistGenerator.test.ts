import { CircuitToNetlist } from "analog/api/circuit/sim/NetlistGenerator";
import { CreateCircuit } from "analog/api/circuit/public";
import { AnalogCircuitImpl } from "analog/api/circuit/public/impl/AnalogCircuit";
import { V } from "Vector";

describe("NetlistGenerator", () => {
    it("should generate a valid netlist for a simple circuit with Ground", () => {
        const circuit = CreateCircuit();
        
        const v1 = circuit.placeComponentAt("VoltageSource", V(0,0));
        v1.setProp("V", 5);

        const r1 = circuit.placeComponentAt("Resistor", V(0,0));
        r1.setProp("R", 1000);

        const g1 = circuit.placeComponentAt("Ground", V(0,0));

        // Connect V1(+) to R1(1)
        v1.ports["+"][0].connectTo(r1.ports[""][0]);
        // Connect V1(-) to Ground
        v1.ports["-"][0].connectTo(g1.ports[""][0]);
        // Connect R1(2) to Ground
        r1.ports[""][1].connectTo(g1.ports[""][0]);

        const internal = (circuit as AnalogCircuitImpl)["ctx"].internal;
        const [netlist, mappings] = CircuitToNetlist("TestCircuit", { kind: "op" }, internal);

        expect(netlist.title).toEqual("TestCircuit");
        expect(netlist.elements.length).toEqual(2); // V and R, Ground is implicit in nodes
        expect(netlist.analyses.length).toEqual(1);
        expect(netlist.analyses[0]).toEqual({ kind: "op" });

        const vSource = netlist.elements.find(e => e.symbol === "V");
        const resistor = netlist.elements.find(e => e.symbol === "R");

        expect(vSource).toBeDefined();
        expect(resistor).toBeDefined();

        // Node 0 should be ground
        expect(vSource!.node2).toEqual("0"); // V1(-) is ground
        expect(resistor!.node2).toEqual("0"); // R1(2) is ground

        // Node 1 should connect V1(+) and R1(1)
        expect(vSource!.node1).toEqual(resistor!.node1);
        expect(vSource!.node1).not.toEqual("0");

        expect(vSource!.values).toEqual(["DC", "5"]);
        expect(resistor!.values).toEqual(["1000"]);
    });

    it("should throw an error if no Ground is present", () => {
        const circuit = CreateCircuit();
        
        const v1 = circuit.placeComponentAt("VoltageSource", V(0,0));
        v1.setProp("V", 5);

        const r1 = circuit.placeComponentAt("Resistor", V(0,0));
        r1.setProp("R", 1000);

        // Connect V1(+) to R1(1)
        v1.ports["+"][0].connectTo(r1.ports[""][0]);
        // Connect V1(-) to R1(2)
        v1.ports["-"][0].connectTo(r1.ports[""][1]);

        const internal = (circuit as AnalogCircuitImpl)["ctx"].internal;

        expect(() => {
            CircuitToNetlist("TestCircuit", { kind: "op" }, internal);
        }).toThrow("Circuit must contain at least one Ground node!");
    });

    it("should handle multiple isolated subcircuits", () => {
        const circuit = CreateCircuit();
        
        // Subcircuit 1
        const v1 = circuit.placeComponentAt("VoltageSource", V(0,0));
        v1.setProp("V", 5);
        const r1 = circuit.placeComponentAt("Resistor", V(0,0));
        r1.setProp("R", 1000);
        const g1 = circuit.placeComponentAt("Ground", V(0,0));

        v1.ports["+"][0].connectTo(r1.ports[""][0]);
        v1.ports["-"][0].connectTo(g1.ports[""][0]);
        r1.ports[""][1].connectTo(g1.ports[""][0]);

        // Subcircuit 2 (Isolated)
        const v2 = circuit.placeComponentAt("VoltageSource", V(10,0));
        v2.setProp("V", 10);
        const r2 = circuit.placeComponentAt("Resistor", V(10,0));
        r2.setProp("R", 2000);
        const g2 = circuit.placeComponentAt("Ground", V(10,0));

        v2.ports["+"][0].connectTo(r2.ports[""][0]);
        v2.ports["-"][0].connectTo(g2.ports[""][0]);
        r2.ports[""][1].connectTo(g2.ports[""][0]);

        const internal = (circuit as AnalogCircuitImpl)["ctx"].internal;
        const [netlist, mappings] = CircuitToNetlist("TestCircuit", { kind: "op" }, internal);

        expect(netlist.elements.length).toEqual(4); // V1, R1, V2, R2
    });
});
