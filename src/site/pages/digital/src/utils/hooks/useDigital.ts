import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {ThunkDispatch}                          from "redux-thunk";

import {AppState} from "site/digital/state";

import {AllActions} from "site/digital/state/actions";


export const useDigitalDispatch = () => useDispatch<ThunkDispatch<AppState, undefined, AllActions>>();

export const useDigitalSelector = <TSelected = unknown>(
    selector: (state: AppState) => TSelected,
    equalityFn: (left: TSelected, right: TSelected) => boolean = shallowEqual,
) => useSelector<AppState, TSelected>(selector, equalityFn)
