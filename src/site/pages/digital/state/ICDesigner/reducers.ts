import {AllActions} from "../actions";

import {OPEN_IC_DESIGNER_ID, CLOSE_IC_DESIGNER_ID} from "./actionTypes";
import {ICDesignerState} from "./state";


const initialState = {
    active: false,
    ic: undefined
} as ICDesignerState;

export function icDesignerReducer(state = initialState, action: AllActions): ICDesignerState {
    switch (action.type) {
        case OPEN_IC_DESIGNER_ID:
            return {
                active: true,
                ic: action.data
            };
        case CLOSE_IC_DESIGNER_ID:
            return {
                active: false,
                ic: undefined
            };
        default:
            return state;
    }
}
