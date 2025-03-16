import {CircuitInternal, GUID} from "shared/api/circuit/internal";
import {ObservableImpl}        from "shared/api/circuit/utils/Observable";
import {Signal}                from "./Signal";
import {PropagatorFunc, PropagatorsMap} from "./DigitalPropagators";
import {DigitalComponentConfigurationInfo} from "../DigitalComponents";
import {AddErrE} from "shared/api/circuit/utils/MultiError";


type DigitalSimEvent = {
    type: "step";
    updatedInputPorts: Set<GUID>;
    updatedOutputPorts: Set<GUID>;
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

    public addPropagator(kind: string, propagator: PropagatorFunc): void {
        this.propagators[kind] = propagator;
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

    private getPortsByGroup(compId: GUID) {
        return this.circuit.getPortsByGroup(compId)
            .mapErr(AddErrE("DigitalSim: Failed to get ports by group!"))
            .unwrap();
    }

    private getPortsForPort(portId: GUID) {
        return this.circuit.getPortsForPort(portId)
            .map((ids) =>
                [...ids].map((id) =>
                    this.circuit.getPortByID(id)
                        .mapErr(AddErrE("DigitalSim: Failed to get port Schema for port"))
                        .unwrap()))
            .mapErr(AddErrE("DigitalSim: Failed to get ports for port!"))
            .unwrap();
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

    private callPropagator(id: GUID): ReturnType<PropagatorFunc> {
        const [comp, info] = this.getComponentAndInfoById(id).unwrap();
        const ports = this.getPortsByGroup(id);

        // Get signals from each input port and put it in a record of group: signals[]
        const inputSignals = Object.fromEntries(
            info.inputPortGroups.map((group) =>
                [group, ports[group].map((id) => this.getSignal(id))]));
        const state = this.states.get(comp.id);

        const propagator = this.propagators[comp.kind];
        if (!propagator)
            throw new Error(`DigitalSim.step: Failed to find propagator for kind: '${comp.kind}'`);

        const { outputs, nextState } = propagator(comp, inputSignals, state);

        // Maybe check this?
        // for (const [group, signals] of Object.entries(outputs)) {
        //     if (!info.outputPortGroups.includes(group)) {
        //         throw new Error(`DigitalSim.step: Propagator for '${comp.kind}' returned ` +
        //                         `a signal for group '${group}' which is not an output port!`);
        //     }
        // }

        return { outputs, nextState };
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

        const updatedInputPorts = new Set<GUID>(), updatedOutputPorts = new Set<GUID>();

        for (const id of next) {
            if (!this.circuit.hasComp(id))  // Ignore deleted objects
                continue;

            const { outputs, nextState } = this.callPropagator(id);

            // Update signal outputs
            const ports = this.getPortsByGroup(id);
            for (const [group, signals] of Object.entries(outputs)) {
                signals.forEach((val, i) => {
                    const portId = ports[group][i];

                    // No need to update if the signal is the same
                    if (this.signals.get(portId) === val)
                        return;
                    this.signals.set(portId, val);
                    updatedOutputPorts.add(portId);

                    // It is assumed (and hopefully constrained) that all ports connected to
                    // an output port will be input ports.
                    this.getPortsForPort(portId).forEach((port) => {
                        this.signals.set(port.id, val);
                        updatedInputPorts.add(port.id);

                        // Add parent for next step
                        this.next.add(port.parent);
                    });
                });
            }

            // Update state
            if (nextState)
                this.states.set(id, nextState);
        }

        this.publish({ type: "step", updatedInputPorts, updatedOutputPorts, queueEmpty: (this.next.size === 0) });
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
