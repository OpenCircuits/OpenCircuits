import {Store} from "redux";
import {ThunkDispatch} from "redux-thunk";
import {SharedAppState}  from "shared/state";
import {AllActions} from "./actions";


export type AppState = SharedAppState & {
}

export type AppStore = Store<AppState, AllActions> & {
    dispatch: ThunkDispatch<AppState, undefined, AllActions>;
}
