import {GUID}       from "core/utils/GUID";
import {Observable} from "core/utils/Observable";

import {DigitalComponent, DigitalObj, DigitalPort, DigitalPortGroup} from "core/models/types/digital";

import {Signal} from "digital/models/sim/Signal";

import {DigitalCircuitController} from "digital/controllers/DigitalCircuitController";

import {Propagate} from "./Propagators";


type DigitalSimEvent = {
    type: "step";
    queueEmpty: boolean;
} | {
    type: "queue";
    id: GUID;
}

export class DigitalSim extends Observable<DigitalSimEvent> {
    private readonly circuit: DigitalCircuitController;

    // Map of every port in the circuit to its associated signal.
    private readonly signals: Map<GUID, Signal>;

    // States for each component, needed for things like FlipFlops which store a signal as a state.
    private readonly states: Map<GUID, unknown>;

    // Propagation is IDs of components to propagate a signal through.
    private readonly propagationQueue: Set<GUID>;

    public constructor(circuit: DigitalCircuitController) {
        super();

        this.circuit = circuit;
        this.signals = new Map();
        this.states = new Map();
        this.propagationQueue = new Set();
    }

    private setSignal(port: DigitalPort, signal: Signal): void {
        this.signals.set(port.id, signal);

        // If we're an input port then just set the signal and queue a propagation to the parent
        if (port.group !== DigitalPortGroup.Output) {
            this.queuePropagation(port.parent);
            return;
        }

        // If we're an output port, then find all connections and propagate down the line
        // Find connections and add them to propagation queue
        const wires = this.circuit.getWiresFor(port);
        const ports = wires.map((w) => {
            const [p1, p2] = this.circuit.getPortsForWire(w);
            return ((p1 === port) ? (p2) : (p1));
        });
        ports.forEach((p) => {
            this.signals.set(p.id, signal);
            this.queuePropagation(p.parent);
        });
    }

    public setState(comp: DigitalComponent, state: unknown): void {
        this.states.set(comp.id, state);

        // If state changed, update the component
        this.queuePropagation(comp.id);
    }

    public onAddObj(m: DigitalObj) {
        if (m.baseKind === "Port") {
            // @TODO: might need someway to get initial state?
            this.signals.set(m.id, Signal.Off);

            // Add to propagation queue (@TODO: might need to callback this event / move to method)
            this.queuePropagation(m.parent);
        }
        if (m.baseKind === "Wire") {
            // Get output port from the wire connections and propagate that signal
            const [p1, p2] = this.circuit.getPortsForWire(m);
            const outputPort = (p1.group === DigitalPortGroup.Output ? p1 : p2);
            const signal = this.signals.get(outputPort.id)!;

            // No need to propagate if signal is the same already
            if (this.signals.get(p1.id) === signal && this.signals.get(p2.id) === signal)
                return;
            this.setSignal(outputPort, signal);
        }
    }

    public queuePropagation(id: GUID): void {
        if (this.propagationQueue.has(id)) // Do nothing if this obj is already queued
            return;
        this.propagationQueue.add(id);
        this.publish({ type: "queue", id });
    }

    // @TODO: might need onEditObj, for instance, if a Port is changed to a `not` port

    public onRemoveObj(m: DigitalObj) {
        if (m.baseKind === "Port") {
            this.signals.delete(m.id);

            // Queue parent for propagation
            this.queuePropagation(m.parent);
        }
        if (m.baseKind === "Wire") {
            // Get input port from the connections and set its signal to off since it has no connection now
            const [p1, p2] = this.circuit.getPortsForWire(m);
            const inputPort = (p1.group === DigitalPortGroup.Output ? p2 : p1);
            this.setSignal(inputPort, Signal.Off);
        }
        if (m.baseKind === "Component") {
            this.states.delete(m.id);

            // Remove from propagation queue if we're deleting it
            this.propagationQueue.delete(m.id);
        }
    }

    public step(): void {
        const comps = [...this.propagationQueue].map((id) => this.circuit.getObj(id)) as DigitalComponent[];

        // Clear the queue
        this.propagationQueue.clear();

        // Copy current signals and states
        const curSignals = new Map(this.signals);
        const curStates = new Map(this.states);

        for (const comp of comps) {
            // Group every port by their group and sort by their index
            const ports = this.circuit.getPortsFor(comp);
            const groupedPorts = new Array(3).fill(0) // TODO: Maybe don't hardcode the `3`, use max-group
                .map((_, g) => ports.filter((p) => (p.group === g)).sort((a, b) => (a.index - b.index)));

            // And then get associated signals and state
            const groupedSignals = groupedPorts.map((g) => g.map((p) => curSignals.get(p.id)!));
            const state = curStates.get(comp.id);

            const { nextSignals, nextState } = Propagate(comp, groupedSignals, state);

            // Update signals
            nextSignals.forEach((group, g) => (
                group.forEach((nextSignal, i) => {
                    // Get associated port with new signal
                    const port = groupedPorts[g][i];

                    // If signal is the same, don't do anything
                    if (curSignals.get(port.id) === nextSignal)
                        return;

                    this.setSignal(port, nextSignal);
                })
            ));

            // Update state if it changed
            if (nextState !== state)
                this.setState(comp, nextState);
        }

        this.publish({
            type:       "step",
            queueEmpty: (this.propagationQueue.size === 0),
        });
    }

    public getSignal(p: DigitalPort): Signal {
        return this.signals.get(p.id)!;
    }

    public getState(c: DigitalComponent): unknown {
        return this.states.get(c.id);
    }
}
