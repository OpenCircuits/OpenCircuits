import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {ThunkDispatch}                          from "redux-thunk";

import {AppState} from "digital/site/state";

import {AllActions} from "digital/site/state/actions";


export const useDigitalDispatch = () => useDispatch<ThunkDispatch<AppState, undefined, AllActions>>();

export const useDigitalSelector = <TSelected = unknown>(
    selector: (state: AppState) => TSelected,
    equalityFn: (left: TSelected, right: TSelected) => boolean = shallowEqual,
) => useSelector<AppState, TSelected>(selector, equalityFn)
