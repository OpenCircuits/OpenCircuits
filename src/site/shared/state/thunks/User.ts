import {ThunkAction} from "redux-thunk";

import {QueryUserCircuits} from "shared/api/Circuits";

import {AuthState} from "shared/api/auth/AuthState";

import {SharedAppState}                                  from "..";
import {AllSharedActions}                                from "../actions";
import {_LoadCircuitsFinish, _LoadCircuitsStart, _Login} from "../UserInfo";


type ThunkResult<R> = ThunkAction<R, SharedAppState, undefined, AllSharedActions>;

export function LoadUserCircuits(): ThunkResult<Promise<boolean>> {
    return async (dispatch, getState) => {
        const auth = getState().user.auth;
        if (!auth)
            dispatch(_LoadCircuitsFinish([], "Not logged in!"));

        dispatch(_LoadCircuitsStart());
        try {
            // Attempt to load circuits from backend
            const circuits = await QueryUserCircuits(auth!);
            if (!circuits)
                throw new Error("LoadUserCircuits failed: circuits is undefined");
            dispatch(_LoadCircuitsFinish(circuits));

            return true; // success
        } catch (e) {
            dispatch(_LoadCircuitsFinish([], e));

            return false; // failure
        }
    }
}

export function Login(auth: AuthState): ThunkResult<Promise<void>> {
    return async (dispatch) => {
        dispatch(_Login(auth));
        await dispatch (LoadUserCircuits());
    }
}
