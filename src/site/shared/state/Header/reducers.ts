import {AllSharedActions} from "../actions";

import {CLOSE_HEADER_MENU_ID, CLOSE_HEADER_POPUP_ID, OPEN_HEADER_MENU_ID, OPEN_HEADER_POPUP_ID} from "./actionTypes";
import {HeaderState} from "./state";

const initialState = {
    curMenu: "none",
    curPopup: "none"
} as HeaderState;

export function headerReducer(state = initialState, action: AllSharedActions): HeaderState {
    switch (action.type) {
        case OPEN_HEADER_MENU_ID:
            return {
                ...state,
                curMenu: action.menu
            };
        case OPEN_HEADER_POPUP_ID:
            return {
                ...state,
                curPopup: action.popup
            };
        case CLOSE_HEADER_MENU_ID:
            return {
                ...state,
                curMenu: "none"
            };
        case CLOSE_HEADER_POPUP_ID:
            return {
                ...state,
                curPopup: "none"
            };
        default:
            return state;
    }
}
