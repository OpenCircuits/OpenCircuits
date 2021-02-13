import {AllSharedActions} from "../actions";

import {UserInfoState} from "./state";


const initialState = {
    auth: "",
    isLoggedIn: false,
    circuits: []
} as UserInfoState;

export function userInfoReducer(state = initialState, action: AllSharedActions): UserInfoState {
    switch (action.type) {
        default:
            return state;
    }
}
