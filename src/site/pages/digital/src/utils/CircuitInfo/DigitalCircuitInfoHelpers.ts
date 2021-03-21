import {Deserialize} from "serialeazy";
import {Store} from "redux";

import {OVERWRITE_CIRCUIT_MESSAGE} from "../Constants";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";

import {Circuit, ContentsData} from "core/models/Circuit";
import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {SaveCircuit, SetCircuitId, SetCircuitName, SetCircuitSaved} from "shared/state/CircuitInfo/actions";

import {AppStore} from "../../state";
import {GenerateThumbnail} from "../GenerateThumbnail";
import {RefObject} from "react";
import {SavePDF, SavePNG} from "shared/utils/ImageExporter";
import {SaveFile} from "shared/utils/Exporter";
import {LoadUserCircuits} from "shared/state/UserInfo/actions";
import {DeleteUserCircuit} from "shared/api/Circuits";

import {SAVE_TIME} from "shared/utils/Constants";

export function GetDigitalCircuitInfoHelpers(store: AppStore, canvas: RefObject<HTMLCanvasElement>, info: DigitalCircuitInfo): CircuitInfoHelpers {
    const helpers: CircuitInfoHelpers = {
        LoadCircuit: async (getData) => {
            const {circuit} = store.getState();

            // Prompt to load
            const open = circuit.isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
            if (!open) return;

            const circuitData = await getData();

            const {camera, history, designer, selections, renderer} = info;

            const {metadata, contents} = JSON.parse(circuitData) as Circuit;

            const data = Deserialize<ContentsData>(contents);

            // Load camera, reset selections, clear history, and replace circuit
            camera.setPos(data.camera.getPos());
            camera.setZoom(data.camera.getZoom());

            selections.get().forEach(s => selections.deselect(s));

            history.reset();

            designer.replace(data.designer as DigitalCircuitDesigner);

            renderer.render();

            // Set name, reset id, and set unsaved
            store.dispatch(SetCircuitName(metadata.name));
            store.dispatch(SetCircuitId(""));
            store.dispatch(SetCircuitSaved(false));
        },

        SaveCircuitRemote: async () => {
            const {circuit, user} = store.getState();

            // Don't save while loading
            if (circuit.saving || user.loading)
                return;

            await store.dispatch(SaveCircuit(helpers.GetSerializedCircuit()));
            await store.dispatch(LoadUserCircuits());
        },

        AutoSaveCircuit: async() => {
            const {circuit, user} = store.getState();
            if (user.autoSave && !circuit.isSaved) {
                setInterval(() => helpers.SaveCircuitRemote(), SAVE_TIME);
            }

        },

        SaveCircuitToFile: async (type) => {
            const {circuit} = store.getState();

            switch (type) {
                case "pdf":
                    SavePDF(canvas.current, circuit.name);
                    break;
                case "png":
                    SavePNG(canvas.current, circuit.name);
                    break;
                case "circuit":
                    SaveFile(helpers.GetSerializedCircuit(), circuit.name);
                    break;
            }
        },

        DeleteCircuitRemote: async (circuitData) => {
            const {user} = store.getState();

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
            const {circuit} = store.getState();

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
        }
    }

    return helpers;
}
