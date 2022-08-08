import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isOpen: false,
    },
    {
        ToggleSideNav: () => ({ type: "TOGGLE_SIDENAV_ID" }) as const,
    },
    {
        "TOGGLE_SIDENAV_ID": (state) => ({ isOpen: !state.isOpen }),
    }
);

export type SideNavState = typeof initialState;
export const { ToggleSideNav } = actions;
export const sideNavReducer = reducer;
