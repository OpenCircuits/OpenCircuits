import {CircuitInternal, GUID, uuid} from "shared/api/circuit/internal";
import {CircuitLog}            from "shared/api/circuit/internal/impl/CircuitLog";
import {CircuitDocument}       from "shared/api/circuit/internal/impl/CircuitDocument";

import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {DigitalKinds, DigitalObjInfoProvider} from "digital/api/circuit/internal/DigitalComponents";
import {MakeDigitalCircuitAssembler}        from "digital/api/circuit/internal/assembly/DigitalCircuitAssembler";
import {DigitalSim}                         from "digital/api/circuit/internal/sim/DigitalSim";

import {DigitalCircuit} from "./DigitalCircuit";

import {DigitalCircuitImpl, DigitalIntegratedCircuitImpl} from "./impl/DigitalCircuit";
import {DigitalComponentImpl}   from "./impl/DigitalComponent";
import {DigitalWireImpl}        from "./impl/DigitalWire";
import {DigitalPortImpl}        from "./impl/DigitalPort";
import {DigitalCircuitState}    from "./impl/DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./impl/DigitalComponentInfo";
import {DigitalPropagators} from "../internal/sim/DigitalPropagators";


export * from "./DigitalCircuit";
export * from "./DigitalComponent";
export * from "./DigitalComponentInfo";
export * from "./DigitalPort";
export * from "./DigitalWire";
export * from "./Utilities";


const DigitalKindsToStr: Record<DigitalKinds, string> = {
    [DigitalKinds.IC]:   "IC",
    [DigitalKinds.Wire]: "Wire",
    [DigitalKinds.Port]: "Port",
    [DigitalKinds.Node]: "Node",

    [DigitalKinds.InputPin]:  "InputPin",
    [DigitalKinds.OutputPin]: "OutputPin",

    [DigitalKinds.Button]:         "Button",
    [DigitalKinds.Switch]:         "Switch",
    [DigitalKinds.ConstantLow]:    "ConstantLow",
    [DigitalKinds.ConstantHigh]:   "ConstantHigh",
    [DigitalKinds.ConstantNumber]: "ConstantNumber",
    [DigitalKinds.Clock]:          "Clock",

    [DigitalKinds.LED]:            "LED",
    [DigitalKinds.SegmentDisplay]: "SegmentDisplay",
    [DigitalKinds.BCDDisplay]:     "BCDDisplay",
    [DigitalKinds.ASCIIDisplay]:   "ASCIIDisplay",
    [DigitalKinds.Oscilloscope]:   "Oscilloscope",

    [DigitalKinds.BUFGate]:  "BUFGate",
    [DigitalKinds.NOTGate]:  "NOTGate",
    [DigitalKinds.ANDGate]:  "ANDGate",
    [DigitalKinds.NANDGate]: "NANDGate",
    [DigitalKinds.ORGate]:   "ORGate",
    [DigitalKinds.NORGate]:  "NORGate",
    [DigitalKinds.XORGate]:  "XORGate",
    [DigitalKinds.XNORGate]: "XNORGate",

    [DigitalKinds.SRFlipFlop]: "SRFlipFlop",
    [DigitalKinds.JKFlipFlop]: "JKFlipFlop",
    [DigitalKinds.DFlipFlop]:  "DFlipFlop",
    [DigitalKinds.TFlipFlop]:  "TFlipFlop",

    [DigitalKinds.DLatch]:  "DLatch",
    [DigitalKinds.SRLatch]: "SRLatch",

    [DigitalKinds.Multiplexer]:   "Multiplexer",
    [DigitalKinds.Demultiplexer]: "Demultiplexer",

    [DigitalKinds.Encoder]:    "Encoder",
    [DigitalKinds.Decoder]:    "Decoder",
    [DigitalKinds.Comparator]: "Comparator",
    [DigitalKinds.Label]:      "Label",
};

const StrToDigitalKinds: Record<string, DigitalKinds> =
    Object.fromEntries(Object.entries(DigitalKindsToStr).map(([key, val]) => [val, parseInt(key) as DigitalKinds]));

export function CreateCircuit(): [DigitalCircuit, DigitalCircuitState] {
    const mainCircuitID = uuid();
    const log = new CircuitLog();
    const doc = new CircuitDocument(mainCircuitID, new DigitalObjInfoProvider(), log);
    const internal = new CircuitInternal(log, doc);

    const renderOptions = new DefaultRenderOptions();
    const sim = new DigitalSim(internal, DigitalPropagators);
    const assembler = MakeDigitalCircuitAssembler(internal, sim, renderOptions);

    const cache = {
        comps:     new Map<GUID, DigitalComponentImpl>(),
        wires:     new Map<GUID, DigitalWireImpl>(),
        ports:     new Map<GUID, DigitalPortImpl>(),
        ics:       new Map<GUID, DigitalIntegratedCircuitImpl>(),
        compInfos: new Map<GUID, DigitalComponentInfoImpl>(),
    }


    const state: DigitalCircuitState = {
        internal, assembler, sim, renderOptions,

        constructComponent(id) {
            return cache.comps.getOrInsert(id, (id) => new DigitalComponentImpl(state, id));
        },
        constructWire(id) {
            return cache.wires.getOrInsert(id, (id) => new DigitalWireImpl(state, id));
        },
        constructPort(id) {
            return cache.ports.getOrInsert(id, (id) => new DigitalPortImpl(state, id));
        },
        constructIC(id) {
            return cache.ics.getOrInsert(id, (id) => new DigitalIntegratedCircuitImpl(state, id));
        },
        constructComponentInfo(kind) {
            return cache.compInfos.getOrInsert(kind, (kind) => new DigitalComponentInfoImpl(state, kind));
        },

        kinds: {
            defaultICKind: DigitalKinds.IC,
            asString:      (kind) => DigitalKindsToStr[kind as DigitalKinds] ?? "Unknown",
            fromString:    (str)  => StrToDigitalKinds[str] ?? -1,
        },
    }

    const circuit = new DigitalCircuitImpl(state);

    return [circuit, state];
}
