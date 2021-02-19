import {AllSharedActions} from "../actions";

import {TOGGLE_CIRCUIT_LOCKED_ID} from "../CircuitInfo/actionTypes";
import {TOGGLE_ITEMNAV_ID} from "./actionTypes";
import {ItemNavState} from "./state";

const initialState = {
    isEnabled: true,
    isOpen: false
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
        default:
            return state;
    }
}
