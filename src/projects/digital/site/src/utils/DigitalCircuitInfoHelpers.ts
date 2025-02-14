import {DigitalCircuitDesignerController} from "digital/api/circuit/controllers/DigitalCircuitDesignerController";
import {DigitalCircuit}                   from "digital/api/circuit/schema/DigitalCircuit";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/state/CircuitInfo";

import {AppStore} from "../state";


export function GetDigitalCircuitInfoHelpers(
    store: AppStore,
    app: DigitalCircuitDesignerController
): CircuitInfoHelpers {
    const helpers: CircuitInfoHelpers = {
        LoadCircuit: async (getData) => {
            store.dispatch(_SetCircuitLoading(true));

            const rawCircuitData = await getData();
            if (!rawCircuitData) {
                store.dispatch(_SetCircuitLoading(false));
                throw new Error("DigitalCircuitInfoHelpers.LoadCircuit failed: rawCircuitData is undefined");
            }

            // TODO
            const circuitData = rawCircuitData; // VersionConflictResolver(rawCircuitData);

            const circuit = JSON.parse(circuitData) as DigitalCircuit;

            app.reset(circuit);

            // Set name, id, and set unsaved
            store.dispatch(SetCircuitName(circuit.metadata.name));
            store.dispatch(SetCircuitId(circuit.metadata.id));
            store.dispatch(SetCircuitSaved(true));
            store.dispatch(_SetCircuitLoading(false));
        },

        ResetCircuit: async () => {
            app.reset();

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

        GetSerializedCircuit: () =>
            // TODO
            // const thumbnail = GenerateThumbnail(info);

            // For now just set thumbnail here
            //  TODO: update automatically
            // info.circuit.setMetadata("thumbnail", thumbnail);

            // return JSON.stringify(info.circuit.getRawModel());
             ""
        ,

        DuplicateCircuitRemote: async () => {
            throw new Error("Unimplemented");
        },
    }

    return helpers;
}
