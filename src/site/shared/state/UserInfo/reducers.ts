import {AllSharedActions} from "../actions";
import {LOAD_CIRCUITS_FINISH_ID, LOAD_CIRCUITS_START_ID,
        LOGIN_ACTION_ID, LOGOUT_ACTION_ID, SET_AUTOSAVE} from "./actionTypes";

import {UserInfoState} from "./state";


const initialState = {
    auth: undefined,
    isLoggedIn: false,
    circuits: [],
    loading: false,
    error: undefined,
    autoSave: false
} as UserInfoState;

export function userInfoReducer(state = initialState, action: AllSharedActions): UserInfoState {
    switch (action.type) {
        case LOGIN_ACTION_ID:
            return {...state, auth: action.auth, isLoggedIn: true};
        case LOGOUT_ACTION_ID:
            if (state.auth)
                state.auth.logOut();
            return {...state, auth: undefined, isLoggedIn: false, circuits: []};
        case LOAD_CIRCUITS_START_ID:
            if (!state.auth)
                return {...state, circuits: [], error: "Not logged in!"};
            return {...state, loading: true};
        case LOAD_CIRCUITS_FINISH_ID:
            if (!state.auth)
                return {...state, circuits: [], loading: false, error: "Not logged in!"};
            return {...state, circuits: (action.circuits ?? []), error: action.err, loading: false};
        case SET_AUTOSAVE:
            return {
                ...state, autoSave: !state.autoSave }
        default:
            return state;
    }
}
