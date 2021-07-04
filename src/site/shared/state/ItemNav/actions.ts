import {TOGGLE_ITEMNAV_ID, OPEN_HISTORY_BOX_ID, 
    CLOSE_HISTORY_BOX_ID} from "./actionTypes";


export type ToggleItemNavAction = {
    type: typeof TOGGLE_ITEMNAV_ID;
}

export type OpenHistoryBoxAction = {
    type: typeof OPEN_HISTORY_BOX_ID;
}
export type CloseHistoryBoxAction = {
    type: typeof CLOSE_HISTORY_BOX_ID;
}


export const ToggleItemNav = () => ({ type: TOGGLE_ITEMNAV_ID }) as ToggleItemNavAction;

export const OpenHistoryBox = () => ({
    type: OPEN_HISTORY_BOX_ID
}) as OpenHistoryBoxAction;
export const CloseHistoryBox = () => ({
    type: CLOSE_HISTORY_BOX_ID
}) as CloseHistoryBoxAction;


export type ItemNavActions = 
    ToggleItemNavAction  |
    OpenHistoryBoxAction |
    CloseHistoryBoxAction;
