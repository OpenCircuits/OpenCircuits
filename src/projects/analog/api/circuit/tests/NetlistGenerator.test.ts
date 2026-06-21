import { CircuitToNetlist } from "analog/api/circuit/sim/NetlistGenerator";
import { Schema } from "shared/api/circuit/schema";

// Helper to easily create test circuit mocks
class MockCircuit {
    private comps = new Map<Schema.GUID, any>();
    private wires = new Map<Schema.GUID, any>();
    private ports = new Map<Schema.GUID, any>();

    private portToWires = new Map<Schema.GUID, Set<Schema.GUID>>();
    private compToPorts = new Map<Schema.GUID, Set<Schema.GUID>>();

    public getComps() { return this.comps.keys(); }
    public getCompByID(id: string) { return { unwrap: () => this.comps.get(id) }; }
    
    public getWires() { return this.wires.keys(); }
    public getWireByID(id: string) { return { unwrap: () => this.wires.get(id) }; }
    
    public getPortByID(id: string) { return { unwrap: () => this.ports.get(id) }; }
    
    public getWiresForPort(id: string) { return { unwrap: () => this.portToWires.get(id) || new Set() }; }
    public getPortsForComponent(id: string) { return { unwrap: () => this.compToPorts.get(id) || new Set() }; }

    public addComponent(comp: any, compPorts: string[]) {
        this.comps.set(comp.id, comp);
        this.compToPorts.set(comp.id, new Set(compPorts));
        compPorts.forEach((p, i) => {
            this.ports.set(p, { baseKind: "Port", id: p, parent: comp.id, index: i });
        });
    }

    public addWire(wire: any) {
        this.wires.set(wire.id, wire);
        
        if (!this.portToWires.has(wire.p1)) this.portToWires.set(wire.p1, new Set());
        this.portToWires.get(wire.p1)!.add(wire.id);

        if (!this.portToWires.has(wire.p2)) this.portToWires.set(wire.p2, new Set());
        this.portToWires.get(wire.p2)!.add(wire.id);
    }
}

describe("NetlistGenerator", () => {
    it("should generate a valid netlist for a simple circuit with Ground", () => {
        const circuit = new MockCircuit();
        
        circuit.addComponent({ kind: "VoltageSource", id: "v1", props: { V: 5 } }, ["v1_p1", "v1_p2"]);
        circuit.addComponent({ kind: "Resistor", id: "r1", props: { R: 1000 } }, ["r1_p1", "r1_p2"]);
        circuit.addComponent({ kind: "Ground", id: "g1", props: {} }, ["g1_p1"]);

        // Connect V1(+) to R1(1)
        circuit.addWire({ baseKind: "Wire", id: "w1", p1: "v1_p1", p2: "r1_p1" });
        // Connect V1(-) to Ground
        circuit.addWire({ baseKind: "Wire", id: "w2", p1: "v1_p2", p2: "g1_p1" });
        // Connect R1(2) to Ground
        circuit.addWire({ baseKind: "Wire", id: "w3", p1: "r1_p2", p2: "g1_p1" });

        const [netlist, mappings] = CircuitToNetlist("TestCircuit", { kind: "op" }, circuit as any);

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
        const circuit = new MockCircuit();
        
        circuit.addComponent({ kind: "VoltageSource", id: "v1", props: { V: 5 } }, ["v1_p1", "v1_p2"]);
        circuit.addComponent({ kind: "Resistor", id: "r1", props: { R: 1000 } }, ["r1_p1", "r1_p2"]);

        // Connect V1(+) to R1(1)
        circuit.addWire({ baseKind: "Wire", id: "w1", p1: "v1_p1", p2: "r1_p1" });
        // Connect V1(-) to R1(2)
        circuit.addWire({ baseKind: "Wire", id: "w2", p1: "v1_p2", p2: "r1_p2" });

        expect(() => {
            CircuitToNetlist("TestCircuit", { kind: "op" }, circuit as any);
        }).toThrow("Circuit must contain at least one Ground node!");
    });
});
