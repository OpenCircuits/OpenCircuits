import {AllSharedActions} from "../actions";

import {OPEN_CONTEXT_MENU_ID, CLOSE_CONTEXT_MENU_ID} from "./actionTypes";
import {ContextMenuState} from "./state";


const initialState = {
    isEnabled: true,
    isOpen: false
} as ContextMenuState;

export function contextMenuReducer(state = initialState, action: AllSharedActions): ContextMenuState {
    switch (action.type) {
        case OPEN_CONTEXT_MENU_ID:
            return { ...state, isOpen: true };
        case CLOSE_CONTEXT_MENU_ID:
            return { ...state, isOpen: false };
        default:
            return state;
    }
}
