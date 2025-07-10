/* eslint-disable @typescript-eslint/naming-convention */
import {CircuitDesigner, ToolConfig} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {setCurDesigner} from "./hooks/useDesigner";
import {ToolRenderer} from "shared/api/circuitdesigner/tools/renderers/ToolRenderer";
import {Circuit} from "shared/api/circuit/public";
import {ObjContainer} from "shared/api/circuit/public/ObjContainer";


// These are helpers that need to be overridden per-circuit-type (digital, analog, etc.)
// But are used more broadly by the shared site.
// Mostly relating to I/O and initializations.
export interface OverrideCircuitHelpers {
    CreateAndInitializeDesigner: (tools?: {config: ToolConfig, renderers?: ToolRenderer[]}) => CircuitDesigner;

    Serialize: (circuitOrObjs: Circuit | ObjContainer) => { data: Blob, version: string };
    SerializeAsString: (circuitOrObjs: Circuit | ObjContainer) => string;
    DeserializeCircuit: (data: string | ArrayBuffer) => Circuit;
}

// These are helpers that can be defined in a shared context and apply to all types.
export interface SharedCircuitHelpers {
    LoadNewCircuit: (data: string | ArrayBuffer) => CircuitDesigner;
}

export type CircuitHelpers = OverrideCircuitHelpers & SharedCircuitHelpers;


const { OverrideCircuitHelpers, SetCircuitHelpers } = (() => {
    let curCircuitHelpers: OverrideCircuitHelpers | undefined;

    // Helper factory function that returns a version of the CircuitHelpers method
    // except it throws if the current set of circuit helpers is undefined.
    function errIfUndefined<K extends keyof OverrideCircuitHelpers>(k: K) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function callSafely<F extends (...args: any[]) => any>(func: F, ...args: Parameters<F>): ReturnType<F> {
            return func(...args);
        }

        return (...args: Parameters<OverrideCircuitHelpers[K]>): ReturnType<OverrideCircuitHelpers[K]> => {
            if (!curCircuitHelpers)
                throw new Error(`CircuitHelpers.${k}: CircuitHelpers not initialized, please call 'SetCircuitHelpers' on site initialization!`);
            const method = curCircuitHelpers[k];
            return callSafely(method, ...args);
        };
    }

    return {
        OverrideCircuitHelpers: {
            CreateAndInitializeDesigner: errIfUndefined("CreateAndInitializeDesigner"),
            Serialize:                   errIfUndefined("Serialize"),
            SerializeAsString:           errIfUndefined("SerializeAsString"),
            DeserializeCircuit:          errIfUndefined("DeserializeCircuit"),
        } satisfies OverrideCircuitHelpers,
        SetCircuitHelpers: (helpers: OverrideCircuitHelpers) => {
            curCircuitHelpers = helpers;
        },
    };
})();

export {SetCircuitHelpers};

export const CircuitHelpers: CircuitHelpers = {
    ...OverrideCircuitHelpers,

    LoadNewCircuit(data) {
        // Create new circuit to override old one
        const circuit = CircuitHelpers.DeserializeCircuit(data);
        const newDesigner = CircuitHelpers.CreateAndInitializeDesigner();
        newDesigner.circuit.import(circuit, { loadMetadata: true });
        newDesigner.circuit.history.clear();
        setCurDesigner(newDesigner);

        return newDesigner;
    },
}
