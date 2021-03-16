import {AllSharedActions} from "../actions";

import {CLOSE_HISTORY_BOX_ID, OPEN_HISTORY_BOX_ID, TOGGLE_SIDENAV_ID} from "./actionTypes";
import {SideNavState} from "./state";


const initialState = {
    isEnabled: true,
    isOpen: false,
    isHistoryBoxOpen: false
} as SideNavState;

export function sideNavReducer(state = initialState, action: AllSharedActions): SideNavState {
    switch (action.type) {
        case TOGGLE_SIDENAV_ID:
            return {
                ...state,
                // Change isOpen only if isEnabled
                isOpen: (state.isEnabled ? (!state.isOpen) : (state.isOpen))
            };
        case OPEN_HISTORY_BOX_ID:
            return {
                ...state,
                isHistoryBoxOpen: true
            };
        case CLOSE_HISTORY_BOX_ID:
            return {
                ...state,
                isHistoryBoxOpen: false
            };
        default:
            return state;
    }
}
