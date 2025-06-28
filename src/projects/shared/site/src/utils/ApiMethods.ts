import {Circuit} from "shared/api/circuit/public";

import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {BackendCircuitMetadata, CreateUserCircuit, DeleteUserCircuit, LoadCircuitResponse, LoadUserCircuit} from "shared/site/api/Circuits";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/site/state/CircuitInfo";

import {LoadUserCircuits} from "shared/site/state/thunks/User";

import {GenerateThumbnail} from "./GenerateThumbnail";

import {CircuitHelpers} from "./CircuitHelpers";
import {SaveCircuit} from "../state/thunks/SaveCircuit";


const blobToString = (rawContents: Blob) =>
    new Promise<string>((resolve, reject) => {
        // TODO: gzip?
        const reader = new FileReader();
        reader.onloadend = () => {
            const b64Contents = reader.result as string;
            resolve(b64Contents);
        }
        // eslint-disable-next-line unicorn/prefer-add-event-listener
        reader.onabort = reader.onerror = reject;
        reader.readAsDataURL(rawContents);
    });

export const useAPIMethods = (mainCircuit: Circuit) => {
    const { id: curID, auth, saving, loading } = useSharedSelector((state) => ({ ...state.user, ...state.circuit }));
    const dispatch = useSharedDispatch();

    const LoadCircuit = async (dataPromise: Promise<string | ArrayBuffer | LoadCircuitResponse | undefined>) => {
        dispatch(_SetCircuitLoading(true));

        const data = await dataPromise;
        if (!data) {
            dispatch(_SetCircuitLoading(false));
            throw new Error("APIMethods LoadCircuit: data is undefined");
        }

        try {
            const [newDesigner, id] = await (async () => {
                // If loaded from backend, we need to override the metadata with the backend-metadata.
                if (typeof data !== "string" && "metadata" in data && "contents" in data) {
                    const dataURLtoArrayBuffer = (dataurl: string) => {
                        // b64 url is of form:
                        // data:application/octet-stream;base64,DATA
                        // Split by comma to get DATA and decode
                        const bstr = window.atob(dataurl.split(",")[1]); // Decode Base64 data

                        // eslint-disable-next-line unicorn/prefer-code-point
                        return Uint8Array.from(bstr, (c) => c.charCodeAt(0)); // Return the Blob object
                    }
                    const designer = CircuitHelpers.LoadNewCircuit(dataURLtoArrayBuffer(data.contents).buffer);
                    // Specifically don't set the ID since the circuit ID needs to be distinct from
                    // the redux-state-ID to help avoid issues with local and remote saving.
                    // designer.circuit.id = data.metadata.id;
                    designer.circuit.name = data.metadata.name;
                    designer.circuit.desc = data.metadata.desc;
                    return [designer, data.metadata.id] as const;
                }
                return [CircuitHelpers.LoadNewCircuit(data), undefined];
            })();

            // Success! So set name, id, and saved
            dispatch(SetCircuitName(newDesigner.circuit.name));
            dispatch(SetCircuitId(id ?? ""));
            dispatch(SetCircuitSaved(true));
            dispatch(_SetCircuitLoading(false));
        } catch (e) {
            console.error(e);
            dispatch(_SetCircuitLoading(false));
        }
    }

    const LoadCircuitRemote = async (id: string) => {
        if (!auth)
            throw new Error("LoadCircuitRemote: auth is undefined");
        return LoadCircuit(LoadUserCircuit(auth, id));
    }

    const DeleteCircuitRemote = async (id: string) => {
        // Can't delete if not logged in
        if (!auth)
            return;

        await DeleteUserCircuit(auth, id);
        dispatch(SetCircuitId("")); // Reset id
        await dispatch(LoadUserCircuits());
    }

    const SaveCircuitRemote = async () => {
        // Don't save while loading
        if (saving || loading)
            return;

        const { data: rawContents, version } = CircuitHelpers.Serialize(mainCircuit);

        const metadata: BackendCircuitMetadata = {
            // Specifically use the redux-state-ID.
            // This ID will be distinct from mainCircuit.id to help avoid issues with local and remote saving.
            id:        curID,
            name:      mainCircuit.name,
            desc:      mainCircuit.desc,
            thumbnail: GenerateThumbnail(mainCircuit),
            version,
        };

        const contents = await blobToString(rawContents);

        // Save the circuit and reload the user circuits
        return (
            await dispatch(SaveCircuit(metadata, contents)) &&
            await dispatch(LoadUserCircuits())
        );
    }

    const DuplicateCircuitRemote = async () => {
        // Can't duplicate if not logged in
        if (!auth)
            return;

        // Shouldn't be able to duplicate if circuit has never been saved
        if (curID === "")
            return;

        const { data: rawContents, version } = CircuitHelpers.Serialize(mainCircuit);

        const circuitCopy = CircuitHelpers.DeserializeCircuit(await rawContents.arrayBuffer());
        circuitCopy.name += " (Copy)";
        const metadata: BackendCircuitMetadata = {
            id:        "", // Backend will give us a new id
            name:      circuitCopy.name,
            desc:      circuitCopy.desc,
            thumbnail: GenerateThumbnail(mainCircuit),
            version,
        };

        const contents = await blobToString(CircuitHelpers.Serialize(circuitCopy).data);

        // Create circuit copy
        const circuitCopyMetadata = await CreateUserCircuit(auth, { metadata, contents });
        if (!circuitCopyMetadata)
            throw new Error("DuplicateCircuitRemote: circuitCopyMetadata is undefined!");

        // Load circuit copy onto canvas
        await LoadCircuitRemote(circuitCopyMetadata.id);

        await dispatch(LoadUserCircuits());
    }

    return { LoadCircuit, LoadCircuitRemote, DeleteCircuitRemote, SaveCircuitRemote, DuplicateCircuitRemote };
}
