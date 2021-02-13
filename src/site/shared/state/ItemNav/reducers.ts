import {AllSharedActions} from "../actions";

import {TOGGLE_CIRCUIT_LOCKED_ID} from "../CircuitInfo/actionTypes";
import {ADD_IC_DATA_ID, REMOVE_IC_DATA_ID, TOGGLE_ITEMNAV_ID} from "./actionTypes";
import {ItemNavState} from "./state";

const initialState = {
    isEnabled: true,
    isOpen: false,

    ics: []
} as ItemNavState;

export function itemNavReducer(state = initialState, action: AllSharedActions): ItemNavState {
    switch (action.type) {
        case TOGGLE_ITEMNAV_ID:
            return {
                ...state,
                // Change isOpen only if isEnabled
                isOpen: (state.isEnabled ? (!state.isOpen) : (state.isOpen))
            };
        case TOGGLE_CIRCUIT_LOCKED_ID:
            return {
                ...state,
                // Close ItemNav when lock circuit
                isOpen: false
            }
        case ADD_IC_DATA_ID:
            return {
                ...state,
                ics: [...state.ics, action.data]
            }
        case REMOVE_IC_DATA_ID:
            const i = state.ics.findIndex(d => d.index === action.id);
            return {
                ...state,
                ics: [...state.ics.slice(0, i), ...state.ics.slice(i+1)]
            }
        default:
            return state;
    }
}
