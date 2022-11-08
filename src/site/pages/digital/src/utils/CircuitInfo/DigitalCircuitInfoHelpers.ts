import {RefObject} from "react";

// import {OVERWRITE_CIRCUIT_MESSAGE} from "../Constants";

// import {V} from "Vector";

// import {Circuit, ContentsData}  from "core/models/Circuit";
// import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {Circuit} from "core/models/Circuit";

import {DigitalObj} from "core/models/types/digital";

import {DigitalCircuitInfo}      from "digital/utils/DigitalCircuitInfo";
import {VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver";

// import {DigitalCircuitDesigner} from "digital/models";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

// import {CreateUserCircuit, DeleteUserCircuit, LoadUserCircuit} from "shared/api/Circuits";

import {GenerateThumbnail} from "shared/utils/GenerateThumbnail";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/state/CircuitInfo";

// import {SaveCircuit}      from "shared/state/thunks/SaveCircuit";
// import {LoadUserCircuits} from "shared/state/thunks/User";


import {AppStore} from "../../state";


export function GetDigitalCircuitInfoHelpers(
    store: AppStore,
    info: DigitalCircuitInfo,
    reset: (c?: Circuit<DigitalObj>) => void
): CircuitInfoHelpers {
    const helpers: CircuitInfoHelpers = {
        LoadCircuit: async (getData) => {
            store.dispatch(_SetCircuitLoading(true));

            const rawCircuitData = await getData();
            if (!rawCircuitData) {
                store.dispatch(_SetCircuitLoading(false));
                throw new Error("DigitalCircuitInfoHelpers.LoadCircuit failed: rawCircuitData is undefined");
            }

            const circuitData = VersionConflictResolver(rawCircuitData);

            const circuit = JSON.parse(circuitData) as Circuit<DigitalObj>;

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
