import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        debugCullboxes:       false,
        debugPressableBounds: false,
        debugSelectionBounds: false,
        debugNoFill:          false,
    },
    {
        ToggleDebugCullboxes:       () => ({ type: "TOGGLE_DEBUG_CULLBOXES"        }) as const,
        ToggleDebugPressableBounds: () => ({ type: "TOGGLE_DEBUG_PRESSABLE_BOUNDS" }) as const,
        ToggleDebugSelectionBounds: () => ({ type: "TOGGLE_DEBUG_SELECTION_BOUNDS" }) as const,
        ToggleDebugNoFill:          () => ({ type: "TOGGLE_DEBUG_NO_FILL"          }) as const,
    },
    {
        "TOGGLE_DEBUG_CULLBOXES":        (state) => ({ ...state, debugCullboxes: !state.debugCullboxes }),
        "TOGGLE_DEBUG_PRESSABLE_BOUNDS": (state) => ({ ...state, debugPressableBounds: !state.debugPressableBounds }),
        "TOGGLE_DEBUG_SELECTION_BOUNDS": (state) => ({ ...state, debugSelectionBounds: !state.debugSelectionBounds }),
        "TOGGLE_DEBUG_NO_FILL":          (state) => ({ ...state, debugNoFill: !state.debugNoFill }),
    }
);


export type DebugInfoState = typeof initialState;
export const { ToggleDebugCullboxes, ToggleDebugPressableBounds,
              ToggleDebugSelectionBounds, ToggleDebugNoFill } = actions;
export const debugInfoReducer = reducer;
