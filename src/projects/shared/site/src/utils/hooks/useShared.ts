import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {ThunkDispatch}                          from "redux-thunk";

import {SharedAppState} from "shared/site/state";

import {AllSharedActions} from "shared/site/state/actions";


export const useSharedDispatch = () => useDispatch<ThunkDispatch<SharedAppState, undefined, AllSharedActions>>();

export const useSharedSelector = <TSelected = unknown>(
    selector: (state: SharedAppState) => TSelected,
    equalityFn: (left: TSelected, right: TSelected) => boolean = shallowEqual,
) => useSelector<SharedAppState, TSelected>(selector, equalityFn)
