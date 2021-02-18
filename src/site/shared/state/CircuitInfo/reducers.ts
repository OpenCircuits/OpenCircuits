import {AllSharedActions} from "../actions";

import {SET_CIRCUIT_ID_ID, SET_CIRCUIT_NAME_ID, SET_CIRCUIT_SAVED_ID, TOGGLE_CIRCUIT_LOCKED_ID} from "./actionTypes";
import {CircuitInfoState} from "./state";


const initialState = {
    id: "",
    name: "",
    isSaved: false,
    isLocked: false,

    saving: false,
    error: ""
} as CircuitInfoState;

export function circuitInfoReducer(state = initialState, action: AllSharedActions): CircuitInfoState {
    switch (action.type) {
        case SET_CIRCUIT_ID_ID:
            return {
                ...state,
                id: action.id
            };
        case SET_CIRCUIT_NAME_ID:
            return {
                ...state,
                name: action.name
            };
        case SET_CIRCUIT_SAVED_ID:
            return {
                ...state,
                isSaved: action.saved
            };
        case TOGGLE_CIRCUIT_LOCKED_ID:
            return {
                ...state,
                isLocked: !state.isLocked
            }
        default:
            return state;
    }
}
