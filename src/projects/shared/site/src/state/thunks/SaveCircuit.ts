// HOA = Higher-Order Action (creator)

import {ThunkAction} from "redux-thunk";

import {BackendCircuitMetadata, CreateUserCircuit, UpdateUserCircuit} from "shared/site/api/Circuits";

import {SharedAppState} from "shared/site/state";

import {AllSharedActions}       from "shared/site/state/actions";
import {SetCircuitId,
        _SetCircuitSavingFinish,
        _SetCircuitSavingStart} from "shared/site/state/CircuitInfo";


type ThunkResult<R> = ThunkAction<R, SharedAppState, undefined, AllSharedActions>;

export function SaveCircuit(metadata: BackendCircuitMetadata, data: string): ThunkResult<Promise<boolean>> {
    return async (dispatch, getState) => {
        const state = getState();
        const auth = state.user.auth;
        const id = state.circuit.id;

        if (!auth)
            dispatch(_SetCircuitSavingFinish("Not logged in!"));

        dispatch(_SetCircuitSavingStart());

        try {
            const newData = await (id ? UpdateUserCircuit(auth!, { metadata, contents: data }) :
                                        CreateUserCircuit(auth!, { metadata, contents: data }));
            if (!newData)
                throw new Error("SaveCircuit failed: newData is undefined");
            dispatch(SetCircuitId(newData.id));
            dispatch(_SetCircuitSavingFinish());

            return true; // Success
        } catch (e) {
            dispatch(_SetCircuitSavingFinish(String(e)));

            return false; // Failure
        }
    }
}
