import {TOGGLE_SIDENAV_ID} from "./actionTypes";

export type ToggleSideNavAction = {
    type: typeof TOGGLE_SIDENAV_ID;
}

export function ToggleSideNav(): ToggleSideNavAction {
    return {
        type: TOGGLE_SIDENAV_ID
    };
}

export type SideNavActions = ToggleSideNavAction;
