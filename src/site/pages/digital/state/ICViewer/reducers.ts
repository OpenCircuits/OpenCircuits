import {AllActions} from "../actions";

import {OPEN_IC_VIEWER_ID, CLOSE_IC_VIEWER_ID} from "./actionTypes";
import {ICViewerState} from "./state";


const initialState = {
    active: false,
    ic: undefined
} as ICViewerState;

export function icViewerReducer(state = initialState, action: AllActions): ICViewerState {
    switch (action.type) {
        case OPEN_IC_VIEWER_ID:
            return {
                active: true,
                ic: action.data
            };
        case CLOSE_IC_VIEWER_ID:
            return {
                active: false,
                ic: undefined
            };
        default:
            return state;
    }
}
