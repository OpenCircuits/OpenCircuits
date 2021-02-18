import {ThunkAction} from "redux-thunk";
import {CreateUserCircuit, UpdateUserCircuit} from "shared/api/Circuits";
import {SharedAppState} from "..";
import {SET_CIRCUIT_ID_ID, SET_CIRCUIT_NAME_ID,
        SET_CIRCUIT_SAVED_ID, TOGGLE_CIRCUIT_LOCKED_ID,
        SET_CIRCUIT_SAVING_START_ID, SET_CIRCUIT_SAVING_FINISH_ID} from "./actionTypes";


type ThunkResult<R> = ThunkAction<R, SharedAppState, undefined, any>;


export type SetCircuitIdAction = {
    type: typeof SET_CIRCUIT_ID_ID;
    id: string;
}
export type SetCircuitNameAction = {
    type: typeof SET_CIRCUIT_NAME_ID;
    name: string;
}
export type SetCircuitSavedAction = {
    type: typeof SET_CIRCUIT_SAVED_ID;
    saved: boolean;
}
export type SetCircuitSavingStartAction = {
    type: typeof SET_CIRCUIT_SAVING_START_ID;
}
export type SetCircuitSavingFinishAction = {
    type: typeof SET_CIRCUIT_SAVING_FINISH_ID;
    err?: string;
}
export type ToggleCircuitLockedAction = {
    type: typeof TOGGLE_CIRCUIT_LOCKED_ID;
}


export function SaveCircuit(data: string): ThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const state = getState();
        const auth = state.user.auth;
        const id = state.circuit.id;

        if (!auth)
            dispatch({ type: SET_CIRCUIT_SAVING_FINISH_ID, err: "Not logged in!" });

        dispatch({ type: SET_CIRCUIT_SAVING_START_ID });

        try {
            const newData = await (id ? UpdateUserCircuit(auth, id, data) :
                                        CreateUserCircuit(auth, data));

            dispatch(SetCircuitId(newData.getId()));
            dispatch({ type: SET_CIRCUIT_SAVING_FINISH_ID });
        } catch (e) {
            dispatch({ type: SET_CIRCUIT_SAVING_FINISH_ID, err: e });
        }
    }
}

export const SetCircuitId = (id: string) => ({
    type: SET_CIRCUIT_ID_ID,
    id
}) as SetCircuitIdAction;

export const SetCircuitName = (name: string) => ({
    type: SET_CIRCUIT_NAME_ID,
    name
}) as SetCircuitNameAction;

export const SetCircuitSaved = (saved: boolean = true) => ({
    type: SET_CIRCUIT_SAVED_ID,
    saved
}) as SetCircuitSavedAction;

export const ToggleCircuitLocked = () => ({
    type: TOGGLE_CIRCUIT_LOCKED_ID
}) as ToggleCircuitLockedAction;


export type CircuitInfoActions =
    SetCircuitIdAction           |
    SetCircuitNameAction         |
    SetCircuitSavedAction        |
    SetCircuitSavingStartAction  |
    SetCircuitSavingFinishAction |
    ToggleCircuitLockedAction;
