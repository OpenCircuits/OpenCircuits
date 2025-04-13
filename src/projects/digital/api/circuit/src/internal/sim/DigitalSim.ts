import {CircuitInternal, GUID} from "shared/api/circuit/internal";
import {ObservableImpl}        from "shared/api/circuit/utils/Observable";
import {Signal}                from "./Signal";
import {DigitalComponentConfigurationInfo} from "../DigitalComponents";
import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {ReadonlyCircuitStorage} from "shared/api/circuit/internal/impl/CircuitDocument";
import {Schema} from "shared/api/circuit/schema";
import {MapObj} from "shared/api/circuit/utils/Functions";


export type PropagatorFunc = (
    comp: Schema.Component,
    info: DigitalComponentConfigurationInfo,
    state: DigitalSimState,
) => {
    outputs: Map<ContextPath, Signal>;
    nextState?: Signal[];
}
// export type PropagatorFunc = (obj: Schema.Component, signals: Record<string, Signal[]>, state?: Signal[]) => {
//     outputs: Record<string, Signal[]>;
//     nextState?: Signal[];
// };
// Kind : Propagator
export type PropagatorsMap = Record<string, PropagatorFunc>;


type DigitalSimEvent = {
    type: "step";
    updatedInputPorts: Set<ContextPath>;
    updatedOutputPorts: Set<ContextPath>;
    queueEmpty: boolean;
} | {
    type: "queue";
    comps: Set<ContextPath>;
    updatedInputPorts: Set<ContextPath>;
}

class DigitalSimState<M extends Schema.CircuitMetadata = Schema.CircuitMetadata> {
    public readonly storage: ReadonlyCircuitStorage<M>;

    // PortID -> Signal
    public readonly signals: Map<GUID, Signal>;

    // ComponentID -> Signal[]
    public readonly states: Map<GUID, Signal[]>;

    // ICInstance(Component)ID -> DigitalSimState
    public readonly icStates: Map<GUID, DigitalSimState<Schema.IntegratedCircuitMetadata>>;

    public readonly superState: DigitalSimState | undefined;
    private readonly prePath: ContextPath;

    public constructor(
        storage: ReadonlyCircuitStorage<M>,
        superState: DigitalSimState | undefined,
        prePath: ContextPath,
    ) {
        this.storage = storage;
        this.superState = superState;
        this.prePath = prePath;

        this.signals = new Map();
        this.states = new Map();
        this.icStates = new Map();
    }

    public compExistsAndHasPorts(id: GUID) {
        return (this.storage.hasComp(id) && this.storage.getPortsForComponent(id).unwrap().size > 0);
    }

    public getComponentAndInfoByID(id: GUID) {
        return this.storage.getComponentAndInfoByID(id)
            .map(([comp, info]) => {
                if (!(info instanceof DigitalComponentConfigurationInfo))
                    throw new Error(`DigitalSim: Received non-digital component info for ${comp.kind}!`);
                return [comp, info] as const;
            });
    }

    public getPortsByGroup(id: GUID){
        return this.storage.getPortsByGroup(id)
            .mapErr(AddErrE("DigitalSim: Failed to get ports by group!"))
            .unwrap();
    }

    public getPortsForPort(portId: GUID) {
        return this.storage.getPortsForPort(portId)
            .map((ids) =>
                [...ids].map((id) =>
                    this.storage.getPortByID(id)
                        .mapErr(AddErrE("DigitalSim: Failed to get port Schema for port"))
                        .unwrap()))
            .mapErr(AddErrE("DigitalSim: Failed to get ports for port!"))
            .unwrap();
    }

    public isInputPort(portId: GUID): boolean {
        return this.storage.getPortByID(portId)
            .andThen((port) =>
                this.getComponentAndInfoByID(port.parent)
                    .map(([_, info]) => (info.inputPortGroups.includes(port.group))))
            .unwrap();

    }

    public isOutputPort(portId: GUID): boolean {
        return this.storage.getPortByID(portId)
            .andThen((port) =>
                this.getComponentAndInfoByID(port.parent)
                    .map(([_, info]) => (info.outputPortGroups.includes(port.group))))
            .unwrap();

    }

    public isIC(): this is (DigitalSimState & { storage: ReadonlyCircuitStorage<Schema.IntegratedCircuitMetadata> }) {
        return "pins" in this.storage.metadata;
    }

    public getPath(id: GUID): ContextPath {
        return [...this.prePath, id];
    }

    public findState(path: ContextPath): [DigitalSimState, GUID] {
        const [id, ...rest] = path;
        if (rest.length === 0)
            return [this, id];

        const icInstance = this.storage.getCompByID(id).unwrap();
        if (!this.icStates.has(icInstance.id))
            throw new Error(`DigitalSim: Failed to find ic state for ${icInstance.id} in path ${path.join(".")}`);
        return this.icStates.get(icInstance.id)!.findState(rest);
    }
}

// [GUID_0]: Root component ID of GUID_0
// [GUID_1, GUID_0]: Component of ID GUID_0 in IC Instance 'GUID_1' in the root circuit
// [GUID_2, GUID_1, GUID_0]: Component of ID GUID_0 in IC Instance 'GUID_1' in IC Instance 'GUID_2' in root circuit
type ContextPath = GUID[];

export class DigitalSim extends ObservableImpl<DigitalSimEvent> {
    private readonly circuit: CircuitInternal;
    private readonly propagators: PropagatorsMap;

    private readonly rootState: DigitalSimState;

    private readonly next: Map<ContextPath, Set<GUID>>; // ContextPath : InputPortIDs

    public constructor(circuit: CircuitInternal, propagators: PropagatorsMap) {
        super();

        this.circuit = circuit;
        this.propagators = propagators;

        this.rootState = new DigitalSimState(circuit.getInfo(), undefined, []);

        this.next = new Map();

        circuit.subscribe((ev) => {
            const comps = new Set<GUID>(), updatedInputPorts = new Set<GUID>();

            for (const compId of ev.diff.addedComponents) {
                comps.add(compId);

                // Initialize ICs and sub-ICs if the added component is an IC instance
                // TODO[model_refactor_api](leon) -- LOAD (AND SAVE) INITIAL IC STATES SOMEHOW
                const comp = this.circuit.getCompByID(compId).unwrap();
                if (this.circuit.isIC(comp))
                    this.rootState.icStates.set(compId, this.initializeICInstance(this.rootState, compId, comp.kind));
            }

            // Keep states in-case of undos, they can be forgotten when history is cleared
            // for (const compId of ev.diff.removedComponents)
            //     this.states.delete(compId);

            for (const compId of ev.diff.portsChanged) {
                // Removal of ports + component *can* happen at once (batching)
                // So don't add the comp in that case.
                if (!ev.diff.removedComponents.has(compId))
                    comps.add(compId);
            }

            for (const wireId of ev.diff.addedWires) {
                // Instantly propagate signal across the added wires and queue the component
                const wire = circuit.getWireByID(wireId).unwrap();

                // Skip if signals are the same already
                if (this.getSignal(wire.p1) === this.getSignal(wire.p2))
                    continue;

                const p1 = circuit.getPortByID(wire.p1).unwrap(), p2 = circuit.getPortByID(wire.p2).unwrap();
                if (this.rootState.isOutputPort(p1.id)) {
                    this.rootState.signals.set(p2.id, this.getSignal(p1.id));

                    updatedInputPorts.add(p2.id);
                    comps.add(p2.parent);
                } else {
                    this.rootState.signals.set(p1.id, this.getSignal(p2.id));

                    updatedInputPorts.add(p1.id);
                    comps.add(p1.parent);
                }
            }

            const updateInputPort = (portId: GUID) => {
                const result = circuit.getPortByID(portId);
                if (!result.ok)
                    return;
                const port = result.value;
                if (this.rootState.isInputPort(port.id)) {
                    if (this.getSignal(port.id) === Signal.Off)
                        return;
                    this.rootState.signals.set(port.id, Signal.Off);

                    updatedInputPorts.add(port.id);
                    comps.add(port.parent);
                }
            };
            for (const [_wireId, [p1Id, p2Id]] of ev.diff.removedWiresPorts) {
                // Instantly turn off the input port on the wire and queue the component
                updateInputPort(p1Id);
                updateInputPort(p2Id);
            }

            comps.forEach((id) =>
                this.queueCompWithAllPortsChanged(id));
            this.publish({
                type: "queue",

                // Make them root context paths
                comps:             new Set([...comps].map((c) => [c])),
                updatedInputPorts: new Set([...updatedInputPorts].map((p) => [p])),
            });
        })
    }

    private queueComp(path: ContextPath, ports: GUID[]) {
        const prevPorts = this.next.get(path) ?? new Set();
        this.next.set(path, new Set([...prevPorts, ...ports]))
    }
    private queueCompWithAllPortsChanged(id: GUID) {
        // Newly added components should update ALL their input ports
        const [_comp, info] = this.rootState.getComponentAndInfoByID(id).unwrap();
        const ports = Object.values(
            MapObj(this.circuit.getPortsByGroup(id).unwrap(), ([group, ports]) =>
                (info.inputPortGroups.includes(group)) ? ports : [])
        ).flat();
        this.queueComp([id], ports);
    }

    private initializeICInstance(
        cur: DigitalSimState,
        compId: GUID,
        icId: GUID,
    ): DigitalSimState<Schema.IntegratedCircuitMetadata> {
        const ic = this.circuit.getICInfo(icId).unwrap();
        const newState = new DigitalSimState(ic, cur, cur.getPath(compId));

        // Load sub-ICs
        for (const compId of ic.getComponents()) {
            const comp = ic.getCompByID(compId).unwrap();
            if (this.circuit.isIC(comp))
                newState.icStates.set(compId, this.initializeICInstance(newState, compId, comp.kind));
        }

        return newState;
    }

    /**
     * Sets the state of a component.
     *
     * @param id    Component's id.
     * @param state Component's state.
     */
    public setState(id: GUID, state: Signal[]): void {
        this.rootState.states.set(id, state);

        this.queueCompWithAllPortsChanged(id);

        this.publish({
            type:              "queue",
            comps:             new Set([[id]]),
            updatedInputPorts: new Set(),
        });
    }

    public step(): void {
        const next = [...this.next];
        this.next.clear();

        const updatedInputPorts = new Set<ContextPath>(), updatedOutputPorts = new Set<ContextPath>();

        for (const [path, changedInputPorts] of next) {
            const [state, id] = this.rootState.findState(path);

            if (!state.compExistsAndHasPorts(id))  // Ignore deleted objects
                continue;

            const [comp, info] = state.getComponentAndInfoByID(id).unwrap();
            if (this.circuit.isIC(comp)) {
                // Queue the components associated with the changed input ports
                for (const inputPortId of changedInputPorts) {
                    // Get internal InputPin component and queue it
                    const subState = state.icStates.get(comp.id);
                    if (!subState)
                        throw new Error(`DigitalSim.step: Failed to find sub-state for IC instance: ${comp.id}]`);
                    const inputPort = state.storage.getPortByID(inputPortId).unwrap();

                    const pin = subState.storage.metadata.pins
                        .filter((pin) => (pin.group === inputPort.group))[inputPort.index];
                    const outputPort = subState.storage.getPortByID(pin.id).unwrap();

                    this.queueComp(subState.getPath(outputPort.parent), []);
                }
                continue;
            }

            const propagator = this.propagators[comp.kind];
            if (!propagator)
                throw new Error(`DigitalSim.step: Failed to find propagator for kind: '${comp.kind}'`);

            const { outputs, nextState } = propagator(comp, info, state);

            for (const [portPath, signal] of outputs) {
                const [portState, portId] = this.rootState.findState(portPath);

                // No need to update if the signal is the same
                if (portState.signals.get(portId) === signal)
                    continue;

                portState.signals.set(portId, signal);
                updatedOutputPorts.add(portPath);

                // It is assumed (and hopefully constrained) that all ports connected to
                // an output port will be input ports.
                portState.getPortsForPort(portId).forEach((port) => {
                    portState.signals.set(port.id, signal);
                    updatedInputPorts.add(portState.getPath(port.id));

                    this.queueComp(portState.getPath(port.parent), [port.id]);
                });
            }

            // Update state
            if (nextState)
                state.states.set(id, nextState);
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
        return this.rootState.signals.get(id) ?? Signal.Off;
    }

    /**
     * Gets the state of a component.
     *
     * @param id Component's id.
     * @returns  Component's state.
     */
    public getState(id: GUID): Signal[] | undefined {
        return this.rootState.states.get(id);
    }
}
