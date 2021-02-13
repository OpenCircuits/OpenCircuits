import {SET_CIRCUIT_NAME_ID, SET_CIRCUIT_SAVED_ID, TOGGLE_CIRCUIT_LOCKED_ID} from "./actionTypes";


export type SetCircuitNameAction = {
    type: typeof SET_CIRCUIT_NAME_ID;
    name: string;
}
export type SetCircuitSavedAction = {
    type: typeof SET_CIRCUIT_SAVED_ID;
    saved: boolean;
}
export type ToggleCircuitLockedAction = {
    type: typeof TOGGLE_CIRCUIT_LOCKED_ID;
}


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
    SetCircuitNameAction      |
    SetCircuitSavedAction     |
    ToggleCircuitLockedAction;
