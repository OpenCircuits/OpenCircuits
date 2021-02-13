import {AllSharedActions} from "../actions";

import {TOGGLE_SIDENAV_ID} from "./actionTypes";
import {SideNavState} from "./state";

const initialState = {
    isEnabled: true,
    isOpen: false
} as SideNavState;

export function sideNavReducer(state = initialState, action: AllSharedActions): SideNavState {
    switch (action.type) {
        case TOGGLE_SIDENAV_ID:
            return {
                ...state,
                // Change isOpen only if isEnabled
                isOpen: (state.isEnabled ? (!state.isOpen) : (state.isOpen))
            };
        default:
            return state;
    }
}
