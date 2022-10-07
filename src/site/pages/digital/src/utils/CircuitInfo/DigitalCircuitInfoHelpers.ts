import {RefObject}   from "react";
import {Deserialize} from "serialeazy";


import {OVERWRITE_CIRCUIT_MESSAGE} from "../Constants";

import {V} from "Vector";

import {Circuit, ContentsData}  from "core/models/Circuit";
import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {DigitalCircuitInfo}                                   from "digital/utils/DigitalCircuitInfo";
import {VersionConflictPostResolver, VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver";

import {DigitalCircuitDesigner} from "digital/models";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {CreateUserCircuit, DeleteUserCircuit, LoadUserCircuit} from "shared/api/Circuits";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/state/CircuitInfo";

import {SaveCircuit}      from "shared/state/thunks/SaveCircuit";
import {LoadUserCircuits} from "shared/state/thunks/User";


import {AppStore}          from "../../state";
import {GenerateThumbnail} from "../GenerateThumbnail";


export function GetDigitalCircuitInfoHelpers(store: AppStore, canvas: RefObject<HTMLCanvasElement>,
                                             info: DigitalCircuitInfo): CircuitInfoHelpers {
    const helpers: CircuitInfoHelpers = {
        LoadCircuit: async (getData) => {
            const { circuit } = store.getState();

            // Prompt to load
            const open = circuit.isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
            if (!open)
                return;

            store.dispatch(_SetCircuitLoading(true));

            const circuitDataRaw = await getData();

            if (!circuitDataRaw) {
                store.dispatch(_SetCircuitLoading(false));
                throw new Error("DigitalCircuitInfoHelpers.LoadCircuit failed: circuitData is undefined");
            }

            const { camera, history, designer, selections, renderer } = info;

            // Load data and run through version conflict resolution
            const circuitData = VersionConflictResolver(circuitDataRaw);
            const { metadata, contents } = JSON.parse(circuitData) as Circuit;

            const data = Deserialize<ContentsData>(contents);
            VersionConflictPostResolver(metadata.version, data);

            // Load camera, reset selections, clear history, and replace circuit
            camera.setPos(data.camera.getPos());
            camera.setZoom(data.camera.getZoom());

            selections.get().forEach((s) => selections.deselect(s));

            history.reset();

            designer.replace(data.designer as DigitalCircuitDesigner);

            renderer.render();

            // Set name, id, and set unsaved
            store.dispatch(SetCircuitName(metadata.name));
            store.dispatch(SetCircuitId(metadata.id));
            store.dispatch(SetCircuitSaved(false));
            store.dispatch(_SetCircuitLoading(false));
        },

        ResetCircuit: async () => {
            const { circuit } = store.getState();

            // Prompt to load
            const open = circuit.isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
            if (!open)
                return;

            const { camera, history, designer, selections, renderer } = info;

            // Load camera, reset selections, clear history, and replace circuit
            camera.setPos(V());
            camera.setZoom(1);

            selections.get().forEach((s) => selections.deselect(s));

            history.reset();
            designer.reset();
            renderer.render();

            // Set name, id, and set unsaved
            store.dispatch(SetCircuitName(""));
            store.dispatch(SetCircuitId(""));
            store.dispatch(SetCircuitSaved(true));
        },

        SaveCircuitRemote: async () => {
            const { circuit, user } = store.getState();

            // Don't save while loading
            if (circuit.saving || user.loading)
                return;

            let success = await store.dispatch(SaveCircuit(helpers.GetSerializedCircuit()));
            success = await store.dispatch(LoadUserCircuits()) && success;

            return success;
        },

        DeleteCircuitRemote: async (circuitData) => {
            const { user } = store.getState();

            // Can't delete if not logged in
            if (!user.auth)
                return;

            const shouldDelete = window.confirm(`Are you sure you want to delete circuit "${circuitData.getName()}"?`);
            if (!shouldDelete)
                return;

            await DeleteUserCircuit(user.auth, circuitData.getId());

            store.dispatch(SetCircuitId("")); // Reset id

            await store.dispatch(LoadUserCircuits());
        },

        GetSerializedCircuit: () => {
            const { circuit } = store.getState();

            const thumbnail = GenerateThumbnail({ info });
            return JSON.stringify(
                new Circuit(
                    new CircuitMetadataBuilder()
                        .withName(circuit.name)
                        .withThumbnail(thumbnail)
                        .build()
                        .getDef(),
                    info.designer,
                    info.camera
                )
            );
        },

        DuplicateCircuitRemote: async () => {
            const { user } = store.getState();

            // Can't duplicate if not logged in
            if (!user.auth)
                return;

            const { circuit } = store.getState();

            // Shouldn't be able to duplicate if circuit has never been saved
            if (circuit.id === "")
                return;

            const thumbnail = GenerateThumbnail({ info });
            const circuitCopy = JSON.stringify(
                new Circuit(
                    new CircuitMetadataBuilder()
                        .withName(circuit.name + " (copy)")
                        .withThumbnail(thumbnail)
                        .build()
                        .getDef(),
                    info.designer,
                    info.camera
                )
            );

            // Create circuit copy
            const circuitCopyMetadata = await CreateUserCircuit(user.auth, circuitCopy);

            if (!circuitCopyMetadata)
                throw new Error("GetDigitalCircuitInfoHelpers.DuplicateCircuitRemote failed: " +
                                "circuitCopyMetadata is undefined");

            // Load circuit copy onto canvas
            await helpers.LoadCircuit(() => LoadUserCircuit(user.auth!, circuitCopyMetadata.getId()));

            await store.dispatch(LoadUserCircuits());
        },
    }

    return helpers;
}
