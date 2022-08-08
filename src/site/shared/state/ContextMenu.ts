import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isEnabled: true,
        isOpen:    false,
    },
    {
        OpenContextMenu:  () => ({ type: "OPEN_CONTEXT_MENU_ID" })  as const,
        CloseContextMenu: () => ({ type: "CLOSE_CONTEXT_MENU_ID" }) as const,
    },
    {
        "OPEN_CONTEXT_MENU_ID":  (state) => ({ ...state, isOpen: true  }),
        "CLOSE_CONTEXT_MENU_ID": (state) => ({ ...state, isOpen: false }),
    }
);

export type ContextMenuState = typeof initialState;
export const { OpenContextMenu, CloseContextMenu } = actions;
export const contextMenuReducer = reducer;
