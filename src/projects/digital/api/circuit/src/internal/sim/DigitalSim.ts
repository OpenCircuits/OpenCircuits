import {CircuitInternal, GUID} from "shared/api/circuit/internal";
import {ObservableImpl}        from "shared/api/circuit/utils/Observable";
import {Signal}                from "./Signal";
import {PropagatorsMap} from "./DigitalPropagators";
import {DigitalComponentConfigurationInfo} from "../DigitalComponents";
import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {ErrE, Ok} from "shared/api/circuit/utils/Result";


type DigitalSimEvent = {
    type: "step";
    queueEmpty: boolean;
} | {
    type: "queue";
    id: GUID;
}

export class DigitalSim extends ObservableImpl<DigitalSimEvent> {
    private readonly circuit: CircuitInternal;
    private readonly propagators: PropagatorsMap;

    // PortID -> Signal
    private readonly signals: Map<GUID, Signal>;

    // ComponentID -> Signal[]
    private readonly states: Map<GUID, Signal[]>;

    private readonly next: Set<GUID>;

    public constructor(circuit: CircuitInternal, propagators: PropagatorsMap) {
        super();

        this.circuit = circuit;
        this.propagators = propagators;

        this.signals = new Map();
        this.states = new Map();

        this.next = new Set();

        circuit.subscribe((ev) => {
            const comps = new Set<GUID>();

            // for (const compId of ev.diff.addedComponents)
            //     comps.add(compId);

            for (const compId of ev.diff.removedComponents)
                this.states.delete(compId);

            for (const compId of ev.diff.portsChanged)
                comps.add(compId);

            for (const wireId of ev.diff.addedWires) {
                // Instantly propagate signal across the added wires and queue the component
                const wire = circuit.getWireByID(wireId).unwrap();

                // Skip if signals are the same already
                if (this.getSignal(wire.p1) === this.getSignal(wire.p2))
                    continue;

                const p1 = circuit.getPortByID(wire.p1).unwrap(), p2 = circuit.getPortByID(wire.p2).unwrap();
                if (this.isOutputPort(p1.id)) {
                    this.signals.set(p2.id, this.getSignal(p1.id));

                    comps.add(p2.parent);
                } else {
                    this.signals.set(p1.id, this.getSignal(p2.id));

                    comps.add(p1.parent);
                }
            }

            for (const [_wireId, [p1Id, p2Id]] of ev.diff.removedWiresPorts) {
                // Instantly turn off the input port on the wire and queue the component
                const p1 = circuit.getPortByID(p1Id).unwrap(), p2 = circuit.getPortByID(p2Id).unwrap();
                if (this.isInputPort(p1.id)) {
                    if (this.getSignal(p1.id) === Signal.Off)
                        continue;
                    this.signals.set(p1.id, Signal.Off);

                    comps.add(p1.parent);
                } else {
                    if (this.getSignal(p2.id) === Signal.Off)
                        continue;
                    this.signals.set(p2.id, Signal.Off);

                    comps.add(p2.parent);
                }
            }

            comps.forEach((id) => this.queueComp(id));
        })
    }

    private queueComp(id: GUID): void {
        this.next.add(id);

        this.publish({ type: "queue", id });
    }

    private getComponentAndInfoById(compId: GUID) {
        return this.circuit.getComponentAndInfoById(compId)
            .map(([comp, info]) => {
                if (!(info instanceof DigitalComponentConfigurationInfo))
                    throw new Error(`DigitalSim: Received non-digital component info for ${comp.kind}!`);
                return [comp, info] as const;
            });
    }

    private isInputPort(portId: GUID): boolean {
        return this.circuit.getPortByID(portId)
            .andThen((port) =>
                this.getComponentAndInfoById(port.parent)
                    .map(([_, info]) => (info.inputPortGroups.includes(port.group))))
            .unwrap();

    }

    private isOutputPort(portId: GUID): boolean {
        return this.circuit.getPortByID(portId)
            .andThen((port) =>
                this.getComponentAndInfoById(port.parent)
                    .map(([_, info]) => (info.outputPortGroups.includes(port.group))))
            .unwrap();

    }

    /**
     * Sets the state of a component.
     *
     * @param id    Component's id.
     * @param state Component's state.
     */
    public setState(id: GUID, state: Signal[]): void {
        this.states.set(id, state);

        this.queueComp(id);
    }

    public step(): void {
        const next = [...this.next];
        this.next.clear();

        for (const id of next) {
            const result = this.getComponentAndInfoById(id);
            if (!result.ok)  // Ignore deleted objects
                continue;
            const [comp, info] = result.value;

            const propagator = this.propagators[comp.kind];
            if (!propagator)
                throw new Error(`DigitalSim.step: Failed to find propagator for kind: '${comp.kind}'`);

            const ports = this.circuit.getPortsByGroup(id)
                .mapErr(AddErrE("DigitalSim.step: Failed to get ports by group!"))
                .unwrap();

            // Get signals from each input port and put it in a record of group: signals[]
            const inputSignals = Object.fromEntries(
                info.inputPortGroups.map((group) =>
                    [group, ports[group].map((id) => this.getSignal(id))]));
            const state = this.states.get(id);

            const { outputs, nextState } = propagator(comp, inputSignals, state);

            // Update signal outputs
            for (const [group, signals] of Object.entries(outputs)) {
                if (!info.outputPortGroups.includes(group)) {
                    throw new Error(`DigitalSim.step: Propagator for '${comp.kind}' returned ` +
                                    `a signal for group '${group}' which is not an output port!`);
                }
                signals.forEach((val, i) => {
                    const portId = ports[group][i];

                    // No need to update if the signal is the same
                    if (this.signals.get(portId) === val)
                        return;
                    this.signals.set(portId, val);

                    // It is assumed (and hopefully constrained) that all ports connected to
                    // an output port will be input ports.
                    const connections = this.circuit.getPortsForPort(portId)
                        .mapErr(AddErrE("DigitalSim.step: Failed to get ports for port!"))
                        .unwrap();
                    connections.forEach((id) => {
                        this.signals.set(id, val);

                        // Add parent for next step
                        const parent = this.circuit.getPortByID(id)
                            .mapErr(AddErrE("DigitalSim.step: Failed to get port from connection!"))
                            .unwrap().parent;
                        this.next.add(parent);
                    });
                });
            }

            // Update state
            if (nextState)
                this.states.set(id, nextState);
        }

        this.publish({ type: "step", queueEmpty: (this.next.size === 0) })
    }

    /**
     * Gets the signal of a port.
     *
     * @param id Port's id.
     * @returns  Port's signal.
     */
    public getSignal(id: GUID): Signal {
        return this.signals.get(id) ?? Signal.Off;
    }

    /**
     * Gets the state of a component.
     *
     * @param id Component's id.
     * @returns  Component's state.
     */
    public getState(id: GUID): Signal[] | undefined {
        return this.states.get(id);
    }
}
