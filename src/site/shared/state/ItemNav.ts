import {CreateState} from "shared/utils/CreateState";
import {ToggleCircuitLocked} from "./CircuitInfo";


const [initialState, actions, reducer] = CreateState<typeof ToggleCircuitLocked>()(
    {
        isEnabled: true,
        isOpen: false,
    },
    {
        OpenItemNav: () => ({ type: "OPEN_ITEMNAV_ID" })  as const,
        CloseItemNav: () => ({ type: "CLOSE_ITEMNAV_ID" }) as const,
    },
    {
        "OPEN_ITEMNAV_ID":          (state) => ({ ...state, isOpen: (state.isEnabled ? true : false)  }),
        "CLOSE_ITEMNAV_ID":         (state) => ({ ...state, isOpen: false }),
        "TOGGLE_CIRCUIT_LOCKED_ID": (state) => ({ isEnabled: !state.isEnabled, isOpen: false }),
    }
);

export type ItemNavState = typeof initialState;
export const {OpenItemNav, CloseItemNav} = actions;
export const itemNavReducer = reducer;
