import {useDispatch, useSelector} from "react-redux";
import {ThunkDispatch} from "redux-thunk";

import {AppState} from "site/digital/state";
import {AllActions} from "site/digital/state/actions";


export const useDigitalDispatch = () => {
    return useDispatch<ThunkDispatch<AppState, undefined, AllActions>>();
}

export const useDigitalSelector = <TSelected = unknown>(selector: (state: AppState) => TSelected) => {
    return useSelector<AppState, TSelected>(selector);
}
