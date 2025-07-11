import {useDispatch, useSelector} from "react-redux";
import {ThunkDispatch}            from "redux-thunk";

import {AppState} from "analog/site/state";

import {AllActions} from "analog/site/state/actions";


export const useAnalogDispatch = () => useDispatch<ThunkDispatch<AppState, undefined, AllActions>>();

export const useAnalogSelector = <TSelected = unknown>(selector: (state: AppState) => TSelected) =>
                                    useSelector<AppState, TSelected>(selector)
