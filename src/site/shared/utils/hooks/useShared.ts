import {useDispatch, useSelector} from "react-redux";
import {ThunkDispatch} from "redux-thunk";

import {SharedAppState} from "shared/state";
import {AllSharedActions} from "shared/state/actions";


export const useSharedDispatch = () => {
    return useDispatch<ThunkDispatch<SharedAppState, undefined, AllSharedActions>>();
}

export const useSharedSelector = <TSelected = unknown>(selector: (state: SharedAppState) => TSelected) => {
    return useSelector<SharedAppState, TSelected>(selector);
}
