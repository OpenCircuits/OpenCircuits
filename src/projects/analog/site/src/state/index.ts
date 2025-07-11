import {Store}         from "redux";
import {ThunkDispatch} from "redux-thunk";

import {SharedAppState} from "shared/site/state";

import {AllActions} from "./actions";
import {SimState}   from "./Sim";


export type AppState = SharedAppState & {
    sim: SimState;
}

export type AppStore = Store<AppState, AllActions> & {
    dispatch: ThunkDispatch<AppState, undefined, AllActions>;
}
