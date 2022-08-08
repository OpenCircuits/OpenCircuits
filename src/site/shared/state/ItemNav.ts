import {CreateState} from "shared/utils/CreateState";

import {ToggleCircuitLocked} from "./CircuitInfo";


const [initialState, actions, reducer] = CreateState<typeof ToggleCircuitLocked>()(
    {
        isEnabled: true,
        isOpen:    false,

        isHistoryBoxOpen: false,

        curItemID: "",
    },
    {
        OpenItemNav:  () => ({ type: "OPEN_ITEMNAV_ID"   }) as const,
        CloseItemNav: () => ({ type: "CLOSE_ITEMNAV_ID"  }) as const,

        OpenHistoryBox:  () => ({ type: "OPEN_HISTORY_BOX_ID"  }) as const,
        CloseHistoryBox: () => ({ type: "CLOSE_HISTORY_BOX_ID" }) as const,

        SetCurItem: (id: string) => ({ type: "SET_CUR_ITEM_ID", id }) as const,
    },
    {
        "OPEN_ITEMNAV_ID":          (state)         => ({ ...state, isOpen: (state.isEnabled ? true : false)  }),
        "CLOSE_ITEMNAV_ID":         (state)         => ({ ...state, isOpen: false }),
        "TOGGLE_CIRCUIT_LOCKED_ID": (state)         => ({ ...state, isEnabled: !state.isEnabled, isOpen: false }),

        "OPEN_HISTORY_BOX_ID":  (state) => ({ ...state, isHistoryBoxOpen: true  }),
        "CLOSE_HISTORY_BOX_ID": (state) => ({ ...state, isHistoryBoxOpen: false }),

        "SET_CUR_ITEM_ID": (state, { id }) => ({ ...state, curItemID: id }),
    }
);

export type ItemNavState = typeof initialState;
export const { OpenItemNav, CloseItemNav, OpenHistoryBox, CloseHistoryBox, SetCurItem } = actions;
export const itemNavReducer = reducer;
