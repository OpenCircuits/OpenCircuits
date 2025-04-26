/* eslint-disable @typescript-eslint/naming-convention */
import {Schema} from "shared/api/circuit/schema";
import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";


// These are helpers that need to be overridden per-circuit-type (digital, analog, etc.)
// But are used more broadly by the shared site.
// Mostly relating to I/O and initializations.
export interface CircuitHelpers {
    CreateAndInitializeDesigner: () => CircuitDesigner;

    SerializeCircuit: (circuit: Schema.Circuit) => Blob;
    DeserializeCircuit: (data: string | ArrayBuffer) => Schema.Circuit;
}

const { CircuitHelpers, SetCircuitHelpers } = (() => {
    let curCircuitHelpers: CircuitHelpers | undefined;

    // Helper factory function that returns a version of the CircuitHelpers method
    // except it throws if the current set of circuit helpers is undefined.
    function errIfUndefined<K extends keyof CircuitHelpers>(k: K) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function callSafely<F extends (...args: any[]) => any>(func: F, ...args: Parameters<F>): ReturnType<F> {
            return func(...args);
        }

        return (...args: Parameters<CircuitHelpers[K]>): ReturnType<CircuitHelpers[K]> => {
            if (!curCircuitHelpers)
                throw new Error(`CircuitHelpers.${k}: CircuitHelpers not initialized, please call 'SetCircuitHelpers' on site initialization!`);
            const method = curCircuitHelpers[k];
            return callSafely(method, ...args);
        };
    }

    return {
        CircuitHelpers: {
            CreateAndInitializeDesigner: errIfUndefined("CreateAndInitializeDesigner"),
            SerializeCircuit:            errIfUndefined("SerializeCircuit"),
            DeserializeCircuit:          errIfUndefined("DeserializeCircuit"),
        } satisfies CircuitHelpers,
        SetCircuitHelpers: (helpers: CircuitHelpers) => {
            curCircuitHelpers = helpers;
        },
    };
})();

export {CircuitHelpers, SetCircuitHelpers};
