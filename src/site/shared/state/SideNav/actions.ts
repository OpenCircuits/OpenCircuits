import {TOGGLE_SIDENAV_ID, OPEN_HISTORY_BOX_ID, 
        CLOSE_HISTORY_BOX_ID} from "./actionTypes";


export type ToggleSideNavAction = {
    type: typeof TOGGLE_SIDENAV_ID;
}

export type OpenHistoryBoxAction = {
    type: typeof OPEN_HISTORY_BOX_ID;
}
export type CloseHistoryBoxAction = {
    type: typeof CLOSE_HISTORY_BOX_ID;
}


export const ToggleSideNav = () => ({
    type: TOGGLE_SIDENAV_ID
}) as ToggleSideNavAction;

export const OpenHistoryBox = () => ({
    type: OPEN_HISTORY_BOX_ID
}) as OpenHistoryBoxAction;
export const CloseHistoryBox = () => ({
    type: CLOSE_HISTORY_BOX_ID
}) as CloseHistoryBoxAction;


export type SideNavActions = 
    ToggleSideNavAction  |
    OpenHistoryBoxAction |
    CloseHistoryBoxAction;
