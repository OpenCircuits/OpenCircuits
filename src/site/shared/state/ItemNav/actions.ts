import {TOGGLE_ITEMNAV_ID} from "./actionTypes";


export type ToggleItemNavAction = {
    type: typeof TOGGLE_ITEMNAV_ID;
}


export const ToggleItemNav = () => ({ type: TOGGLE_ITEMNAV_ID }) as ToggleItemNavAction;


export type ItemNavActions = ToggleItemNavAction;
