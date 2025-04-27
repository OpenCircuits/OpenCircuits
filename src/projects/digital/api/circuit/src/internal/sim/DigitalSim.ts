import {ObservableImpl}         from "shared/api/circuit/utils/Observable";
import {AddErrE}                from "shared/api/circuit/utils/MultiError";
import {MapObj}                 from "shared/api/circuit/utils/Functions";
import {CircuitInternal, GUID}  from "shared/api/circuit/internal";
import {ReadonlyCircuitStorage} from "shared/api/circuit/internal/impl/CircuitDocument";
import {Schema}                 from "shared/api/circuit/schema";
import {ObjContainer}           from "shared/api/circuit/public/ObjContainer";

import {DigitalSchema} from "digital/api/circuit/schema";
import {Signal}        from "digital/api/circuit/schema/Signal";

import {DigitalComponentConfigurationInfo} from "../DigitalComponents";


export interface PropagatorInfo {
    propagator: PropagatorFunc;
    // Set of keys corresponding to props on the component
    // that the output state of the component is dependent on
    // (i.e. `inputNum` for ConstantNumber)
    stateProps?: Set<string>;
}
export type PropagatorFunc = (
    comp: Schema.Component,
    info: DigitalComponentConfigurationInfo,
    state: DigitalSimState,
    tickInfo: {
        curTick: number;
        lastStateTick?: number;
    },
) => {
    outputs: Map<ContextPath, Signal>;
    nextState?: Signal[];
    nextCycle?: number;
}

// Kind : Propagator
export type PropagatorsMap = Record<string, PropagatorInfo>;


type DigitalSimEvent = {
    type: "step";
    updatedInputPorts: Set<ContextPath>;
    updatedOutputPorts: Set<ContextPath>;
    updatedCompStates: Set<ContextPath>;
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

    public ticks: Map<GUID, { lastStateTick?: number }>;


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

        this.ticks = new Map();
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

    // TODO[] - add these as CircuitStorage utilities somehow
    public getInputPorts(compId: GUID): GUID[] {
        return this.getComponentAndInfoByID(compId)
            .andThen(([_comp, info]) =>
                this.storage.getPortsByGroup(compId)
                    .map((ports) =>
                        MapObj(ports, ([group, ports]) => info.inputPortGroups.includes(group) ? ports : [])))
            .map((ports) => Object.values(ports).flat())
            .unwrap();
    }

    public getOutputPorts(compId: GUID): GUID[] {
        return this.getComponentAndInfoByID(compId)
            .andThen(([_comp, info]) =>
                this.storage.getPortsByGroup(compId)
                    .map((ports) =>
                        MapObj(ports, ([group, ports]) => info.outputPortGroups.includes(group) ? ports : [])))
            .map((ports) => Object.values(ports).flat())
            .unwrap();
    }

    public isIC(): this is (DigitalSimState &
                           { storage: ReadonlyCircuitStorage<Schema.IntegratedCircuitMetadata> }) {
        return "pins" in this.storage.metadata;
    }

    public getPinCompFromPort(portId: GUID): ContextPath {
        const port = this.storage.getPortByID(portId).unwrap();
        const icState = this.icStates.get(port.parent);
        if (!icState)
            throw new Error(`DigitalSim.getPinCompFromPort: Failed to find IC ${port.parent} from port ${portId}`);
        const pin = icState.storage.metadata.pins.filter((pin) => (pin.group === port.group))[port.index];
        const icPort = icState.storage.getPortByID(pin.id).unwrap();
        return icState.getPath(icPort.parent);
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

    public toSchema(container?: ObjContainer): DigitalSchema.DigitalSimState {
        const compIds = container?.components.map((c) => c.id);

        const signalKeys = container?.ports.map((p) => p.id) ?? this.signals.keys();
        const stateKeys = compIds?.filter((id) => this.states.has(id)) ?? this.states.keys();
        const icStatesKeys = compIds?.filter((id) => this.icStates.has(id)) ?? this.icStates.keys();

        return {
            signals: Object.fromEntries(
                [...signalKeys]
                    // Only serialize for ports that exist
                    .filter((portId) => this.storage.hasPort(portId))
                    .map((key) => [key, this.signals.get(key)!] as const)
                    // Filter undefined or off signals for efficiency purposes
                    .filter(([_, val]) => (!!val))
            ),
            states: Object.fromEntries(
                [...stateKeys]
                    // Only serialize for comps that exist
                    .filter((compId) => this.storage.hasComp(compId))
                    .map((key) => [key, this.states.get(key)!])
            ),
            icStates: Object.fromEntries(
                [...icStatesKeys]
                    // Only serialize for ic instances that exist
                    .filter((compId) => this.storage.hasComp(compId))
                    .map((key) => [key, this.icStates.get(key)!.toSchema()])
            ),
        };
    }
}

// [GUID_0]: Root component ID of GUID_0
// [GUID_1, GUID_0]: Component of ID GUID_0 in IC Instance 'GUID_1' in the root circuit
// [GUID_2, GUID_1, GUID_0]: Component of ID GUID_0 in IC Instance 'GUID_1' in IC Instance 'GUID_2' in root circuit
export type ContextPath = GUID[];

class ContextPathSet {
    private set: Set<string>;

    public constructor() {
        this.set = new Set();
    }

    public has(value: ContextPath): boolean {
        return this.set.has(value.join("."));
    }

    public add(value: ContextPath): ContextPathSet {
        this.set.add(value.join("."));
        return this;
    }

    public delete(value: ContextPath): boolean {
        return this.set.delete(value.join("."));
    }

    public union(other: ContextPathSet): ContextPathSet {
        const newSet = new ContextPathSet();
        newSet.set = this.set.union(other.set);
        return newSet;
    }

    public get size() {
        return this.set.size;
    }

    public *[Symbol.iterator]() {
        for (const item of this.set) {
            yield item.split(".");
        }
    }
}

export class DigitalSim extends ObservableImpl<DigitalSimEvent> {
    public static MAX_QUEUE_AHEAD = 10_000;

    private readonly circuit: CircuitInternal;
    private readonly propagators: PropagatorsMap;

    // States for ICs (not IC-instances), used to load initial states
    // when an instance of the IC is created.
    private readonly initialICStates: Map<GUID, DigitalSchema.DigitalSimState>;

    private readonly rootState: DigitalSimState;

    // Paths to components
    // TODO: Maybe have a sorted data-structure to hold queues at certain ticks
    // rather than abuse JS array indexing magic
    private readonly queue: Array<ContextPathSet | undefined>;

    private curTick: number;

    public constructor(circuit: CircuitInternal, propagators: PropagatorsMap) {
        super();

        this.circuit = circuit;
        this.propagators = propagators;

        this.initialICStates = new Map();
        this.rootState = new DigitalSimState(circuit.getInfo(), undefined, []);

        this.queue = [];

        this.curTick = 0;

        circuit.subscribe((ev) => {
            const comps = new Set<ContextPath>(), updatedInputPorts = new Set<ContextPath>();

            for (const compId of ev.diff.addedComponents) {
                comps.add([compId]);

                // Initialize ICs and sub-ICs if the added component is an IC instance
                const comp = this.circuit.getCompByID(compId).unwrap();
                if (this.circuit.isIC(comp)) {
                    if (!this.initialICStates.has(comp.kind)) {
                        throw new Error("DigitalSim.circuit.subscribe: Failed to find initial state " +
                                        `for new IC instance ${comp.id} (IC: ${comp.kind})`);
                    }
                    const icState = this.initializeICInstance(
                        this.rootState, this.initialICStates.get(comp.kind)!, compId, comp.kind);
                    this.rootState.icStates.set(compId, icState);
                }
            }

            // Keep states in-case of undos, they can be forgotten when history is cleared
            // for (const compId of ev.diff.removedComponents)
            //     this.states.delete(compId);

            for (const [compId] of [...ev.diff.addedPorts, ...ev.diff.removedPorts]) {
                // Removal of ports + component *can* happen at once (batching)
                // So don't add the comp in that case.
                if (ev.diff.removedComponents.has(compId))
                    continue;

                comps.add([compId]);

                // Need to sync Output ports
                const comp = this.circuit.getCompByID(compId).unwrap();
                if (this.circuit.isIC(comp)) {
                    // Queue all OutputPin components in the IC instance, to sync with Output ports
                    this.rootState.getOutputPorts(compId)
                        .map((p) => this.rootState.getPinCompFromPort(p))
                        .forEach((comp) => comps.add(comp));
                }
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

                    updatedInputPorts.add([p2.id]);
                    comps.add([p2.parent]);
                } else {
                    this.rootState.signals.set(p1.id, this.getSignal(p2.id));

                    updatedInputPorts.add([p1.id]);
                    comps.add([p1.parent]);
                }
            }

            // Check if a component prop has changed that requires re-propagating
            for (const [objId, props] of ev.diff.propsChanged) {
                if (circuit.hasComp(objId)) {
                    const comp = circuit.getCompByID(objId);
                    if (!comp.ok)
                        continue;
                    const propagatorInfo = propagators[comp.value.kind];
                    if (!propagatorInfo || !propagatorInfo.stateProps)
                        continue;
                    if (props.intersection(propagatorInfo.stateProps).size === 0)
                        continue;
                    // Clear any forward queues (used i.e. for clock delay changes)
                    for (const set of this.queue) {
                        if (set?.has([objId]))
                            set.delete([objId]);
                    }
                    this.rootState.ticks.set(objId, { lastStateTick: undefined });
                    // Add to queue
                    comps.add([objId]);
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

                    updatedInputPorts.add([port.id]);
                    comps.add([port.parent]);
                }
            };
            for (const [_wireId, [p1Id, p2Id]] of ev.diff.removedWiresPorts) {
                // Instantly turn off the input port on the wire and queue the component
                updateInputPort(p1Id);
                updateInputPort(p2Id);
            }

            comps.forEach((path) =>
                this.queueComp(path));
            this.publish({
                type: "queue",

                comps, updatedInputPorts,
            });
        })
    }

    public loadState(state: DigitalSchema.DigitalSimState) {
        for (const [key, signal] of Object.entries(state.signals))
            this.rootState.signals.set(key, signal);

        for (const [key, s] of Object.entries(state.states))
            this.rootState.states.set(key, s);

        for (const [key, s] of Object.entries(state.icStates)) {
            const comp = this.rootState.storage.getCompByID(key).unwrap();
            this.rootState.icStates.set(
                key,
                this.initializeICInstance(this.rootState, s, comp.id, comp.kind),
            );
        }
    }

    public loadICState(id: GUID, icState: DigitalSchema.DigitalSimState) {
        this.initialICStates.set(id, icState);
    }

    private queueComp(path: ContextPath, next?: ContextPathSet, ports?: GUID[]) {
        const [state, id] = this.rootState.findState(path);

        if (!state.compExistsAndHasPorts(id))  // Ignore deleted objects
            return;

        next = next ?? (this.queue[0] ?? (this.queue[0] = new ContextPathSet()));

        const [comp, _info] = state.getComponentAndInfoByID(id).unwrap();
        if (this.circuit.isIC(comp)) {
            // Get all ports if there aren't any given and queue the
            // internal components associated with the changed input ports
            (ports ?? state.getInputPorts(comp.id))
                .map((p) => state.getPinCompFromPort(p))
                .forEach((comp) => next.add(comp));
        } else {
            next.add(path);
        }
    }

    private initializeICInstance(
        cur: DigitalSimState,
        initialState: DigitalSchema.DigitalSimState,
        compId: GUID,
        icId: GUID,
    ): DigitalSimState<Schema.IntegratedCircuitMetadata> {
        const ic = this.circuit.getICInfo(icId).unwrap();
        const newState = new DigitalSimState(ic, cur, cur.getPath(compId));

        for (const [key, signal] of Object.entries(initialState.signals))
            newState.signals.set(key, signal);

        for (const [key, s] of Object.entries(initialState.states))
            newState.states.set(key, s);

        for (const [key, s] of Object.entries(initialState.icStates)) {
            const [comp, _] = newState.getComponentAndInfoByID(key).unwrap();
            newState.icStates.set(
                comp.id,
                this.initializeICInstance(newState, s, comp.id, comp.kind),
            );
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

        this.queueComp([id]);

        this.publish({
            type:              "queue",
            comps:             new Set([[id]]),
            updatedInputPorts: new Set(),
        });
    }

    public step(): void {
        const cur = this.queue.shift() ?? new ContextPathSet();

        const next = new ContextPathSet();

        const updatedInputPorts = new Set<ContextPath>(),
              updatedOutputPorts = new Set<ContextPath>(),
              updatedCompStates = new Set<ContextPath>();

        for (const path of cur) {
            const [state, id] = this.rootState.findState(path);

            if (!state.compExistsAndHasPorts(id))  // Ignore deleted objects
                continue;

            const [comp, info] = state.getComponentAndInfoByID(id).unwrap();
            const propagatorInfo = this.propagators[comp.kind];
            if (!propagatorInfo)
                throw new Error(`DigitalSim.step: Failed to find propagator for kind: '${comp.kind}'`);

            const { outputs, nextState, nextCycle } = propagatorInfo.propagator(comp, info, state, {
                curTick:       this.curTick,
                lastStateTick: state.ticks.get(comp.id)?.lastStateTick,
            });

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

                    this.queueComp(portState.getPath(port.parent), next, [port.id]);
                });
            }

            // Update state
            if (nextState) {
                state.states.set(id, nextState);
                state.ticks.set(comp.id, { lastStateTick: this.curTick });
                updatedCompStates.add(path);
            }

            // Queue further down the line
            if (nextCycle && nextCycle >= 1) {
                if (nextCycle > DigitalSim.MAX_QUEUE_AHEAD) {
                    console.error(`DigitalSim.step: nextCycle of ${nextCycle} is too large! Comp: ${path.join(".")}`);
                    continue;
                }
                const next = this.queue[nextCycle - 1] ?? (this.queue[nextCycle - 1] = new ContextPathSet());
                next.add(path);
            }
        }

        if (next.size > 0)
            this.queue[0] = this.queue[0] ? this.queue[0].union(next) : next;

        this.curTick++;

        this.publish({
            type:       "step",
            queueEmpty: this.queue.length === 0,
            updatedInputPorts, updatedOutputPorts, updatedCompStates,
        });
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

    public getSimState() {
        return this.rootState;
    }

    public getInitialICSimState(ic: GUID) {
        return this.initialICStates.get(ic);
    }
}
