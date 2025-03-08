import {CreateState} from "shared/site/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        debugPrimBounds: false,

        debugComponentBounds: false,
        debugPortBounds:      false,
        debugWireBounds:      false,

        debugPressableBounds: false,
    },
    {
        ToggleDebugPrimBounds: () => ({ type: "TOGGLE_DEBUG_PRIM_BOUNDS" }) as const,

        ToggleDebugComponentBounds: () => ({ type: "TOGGLE_DEBUG_COMPONENT_BOUNDS" }) as const,
        ToggleDebugPortBounds:      () => ({ type: "TOGGLE_DEBUG_PORT_BOUNDS"      }) as const,
        ToggleDebugWireBounds:      () => ({ type: "TOGGLE_DEBUG_WIRE_BOUNDS"      }) as const,

        ToggleDebugPressableBounds: () => ({ type: "TOGGLE_DEBUG_PRESSABLE_BOUNDS" }) as const,
    },
    {
        "TOGGLE_DEBUG_PRIM_BOUNDS": (state) => ({ ...state, debugPrimBounds: !state.debugPrimBounds }),

        "TOGGLE_DEBUG_COMPONENT_BOUNDS": (state) => ({ ...state, debugComponentBounds: !state.debugComponentBounds }),
        "TOGGLE_DEBUG_PORT_BOUNDS":      (state) => ({ ...state, debugPortBounds: !state.debugPortBounds }),
        "TOGGLE_DEBUG_WIRE_BOUNDS":      (state) => ({ ...state, debugWireBounds: !state.debugWireBounds }),

        "TOGGLE_DEBUG_PRESSABLE_BOUNDS": (state) => ({ ...state, debugPressableBounds: !state.debugPressableBounds }),
    }
);


export type DebugInfoState = typeof initialState;
export const { ToggleDebugPrimBounds, ToggleDebugComponentBounds,
               ToggleDebugPortBounds, ToggleDebugWireBounds, ToggleDebugPressableBounds } = actions;
export const debugInfoReducer = reducer;
