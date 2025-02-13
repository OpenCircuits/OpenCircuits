// HOA = Higher-Order Action (creator)

import {ThunkAction} from "redux-thunk";

import {CreateUserCircuit, UpdateUserCircuit} from "shared/src/api/Circuits";

import {SharedAppState} from "shared/src/state";

import {AllSharedActions}       from "shared/src/state/actions";
import {SetCircuitId,
        _SetCircuitSavingFinish,
        _SetCircuitSavingStart} from "shared/src/state/CircuitInfo";


type ThunkResult<R> = ThunkAction<R, SharedAppState, undefined, AllSharedActions>;

export function SaveCircuit(data: string): ThunkResult<Promise<boolean>> {
    return async (dispatch, getState) => {
        const state = getState();
        const auth = state.user.auth;
        const id = state.circuit.id;

        if (!auth)
            dispatch(_SetCircuitSavingFinish("Not logged in!"));

        dispatch(_SetCircuitSavingStart());

        try {
            const newData = await (id ? UpdateUserCircuit(auth!, id, data) :
                                        CreateUserCircuit(auth!, data));
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
