import {DebugOptions} from "shared/api/circuitdesigner/public/impl/DebugOptions";

import {DEBUG_VALUES_COOKIE_KEY} from "shared/site/utils/Constants";

import {GetCookie, SetCookie} from "shared/site/utils/Cookies";
import {CreateState}          from "shared/site/utils/CreateState";


const defaultDebugVals = {
    debugPrims:              false,
    debugPrimBounds:         false,
    debugPrimOrientedBounds: false,

    debugComponentBounds: false,
    debugPortBounds:      false,
    debugWireBounds:      false,

    debugPressableBounds: false,
};
const initialDebugVals: DebugOptions = JSON.parse(GetCookie(DEBUG_VALUES_COOKIE_KEY) || "false") || defaultDebugVals;
Object.entries(defaultDebugVals).forEach(([key, val]) => {
    if (!(key in initialDebugVals))
        initialDebugVals[key as keyof DebugOptions] = val;
});

const [initialState, actions, reducer] = CreateState()(
    initialDebugVals,
    {
        ToggleDebugValue: (key: keyof DebugOptions) => ({ type: "TOGGLE_DEBUG_VALUE", key }) as const,
    },
    {
        "TOGGLE_DEBUG_VALUE": (state, { key }) => {
            const newState = { ...state, [key]: !state[key] };
            SetCookie(DEBUG_VALUES_COOKIE_KEY, JSON.stringify(newState));
            return newState;
        },
    }
);


export type DebugInfoState = typeof initialState;
export const { ToggleDebugValue } = actions;
export const debugInfoReducer = reducer;
