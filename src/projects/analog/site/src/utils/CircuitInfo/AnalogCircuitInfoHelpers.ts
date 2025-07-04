import {Circuit} from "shared/api/circuit/models/Circuit";

import {AnalogObj} from "shared/api/circuit/models/types/analog";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {CircuitInfoHelpers} from "shared/site/utils/CircuitInfoHelpers";
import {GenerateThumbnail}  from "shared/site/utils/GenerateThumbnail";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/site/state/CircuitInfo";

import {AppStore} from "../../state";


export function GetAnalogCircuitInfoHelpers(
    store: AppStore,
    info: AnalogCircuitInfo,
    reset: (c?: Circuit<AnalogObj>) => void
): CircuitInfoHelpers {
    const helpers: CircuitInfoHelpers = {
        LoadCircuit: async (getData) => {
            store.dispatch(_SetCircuitLoading(true));

            const rawCircuitData = await getData();
            if (!rawCircuitData) {
                store.dispatch(_SetCircuitLoading(false));
                throw new Error("DigitalCircuitInfoHelpers.LoadCircuit failed: rawCircuitData is undefined");
            }

            const circuitData = rawCircuitData;

            const circuit = JSON.parse(circuitData) as Circuit<AnalogObj>;

            reset(circuit);

            // Set name, id, and set unsaved
            store.dispatch(SetCircuitName(circuit.metadata.name));
            store.dispatch(SetCircuitId(circuit.metadata.id));
            store.dispatch(SetCircuitSaved(true));
            store.dispatch(_SetCircuitLoading(false));
        },

        ResetCircuit: async () => {
            reset();

            // Set name, id, and set unsaved
            store.dispatch(SetCircuitName(""));
            store.dispatch(SetCircuitId(""));
            store.dispatch(SetCircuitSaved(true));
        },

        SaveCircuitRemote: async () => {
            throw new Error("Unimplemented");
        },

        DeleteCircuitRemote: async (circuitData) => {
            throw new Error("Unimplemented");
        },

        GetSerializedCircuit: () => {
            const thumbnail = GenerateThumbnail(info);

            // For now just set thumbnail here
            //  TODO: update automatically
            info.circuit.setMetadata("thumbnail", thumbnail);

            return JSON.stringify(info.circuit.getRawModel());
        },

        DuplicateCircuitRemote: async () => {
            throw new Error("Unimplemented");
        },
    }

    return helpers;
}
