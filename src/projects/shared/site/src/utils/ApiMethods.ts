import {RootCircuit} from "shared/api/circuit/public";

import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CreateUserCircuit, DeleteUserCircuit, LoadUserCircuit} from "shared/site/api/Circuits";

import {SetCircuitId, SetCircuitName, SetCircuitSaved, _SetCircuitLoading} from "shared/site/state/CircuitInfo";

import {SaveCircuit}      from "shared/site/state/thunks/SaveCircuit";
import {LoadUserCircuits} from "shared/site/state/thunks/User";

import {GenerateThumbnail} from "./GenerateThumbnail";
import {Schema} from "shared/api/circuit/schema";


export const useAPIMethods = (mainCircuit: RootCircuit) => {
    const { id: curID, auth, saving, loading } = useSharedSelector((state) => ({ ...state.user, ...state.circuit }));
    const dispatch = useSharedDispatch();

    const LoadCircuit = async (dataPromise: Promise<string | undefined>) => {
        dispatch(_SetCircuitLoading(true));

        const data = await dataPromise;
        if (!data) {
            dispatch(_SetCircuitLoading(false));
            throw new Error("APIMethods LoadCircuit: data is undefined");
        }

        try {
            // TODO: Make sure data is valid
            mainCircuit.loadSchema(JSON.parse(data) as Schema.RootCircuit);
        } catch (e) {
            console.error(e);
            dispatch(_SetCircuitLoading(false));
            return;
        }

        // Success! So set name, id, and saved
        dispatch(SetCircuitName(mainCircuit.name));
        dispatch(SetCircuitId(mainCircuit.id));
        dispatch(SetCircuitSaved(true));
        dispatch(_SetCircuitLoading(false));
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

        // Update thumbnail
        mainCircuit.thumbnail = GenerateThumbnail(mainCircuit);

        // Save the circuit and reload the user circuits
        return (
            // TODO: Replacement for serialize
            // await dispatch(SaveCircuit(mainCircuit.serialize())) &&
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

        const thumbnail = GenerateThumbnail(mainCircuit);

        // TODO: Either implement circuit.copy() or workaround with copying selections and name
        /**
        const circuitCopy = mainCircuit.copy();
        circuitCopy.name = circuitCopy.name + " (Copy)";
        circuitCopy.thumbnail = thumbnail;

        // Create circuit copy
        const circuitCopyMetadata = await CreateUserCircuit(auth, circuitCopy.serialize());
        if (!circuitCopyMetadata)
            throw new Error("DuplicateCircuitRemote: circuitCopyMetadata is undefined!");

        // Load circuit copy onto canvas
        await LoadCircuitRemote(circuitCopyMetadata.id);
        */

        await dispatch(LoadUserCircuits());
    }

    return { LoadCircuit, LoadCircuitRemote, DeleteCircuitRemote, SaveCircuitRemote, DuplicateCircuitRemote };
}
