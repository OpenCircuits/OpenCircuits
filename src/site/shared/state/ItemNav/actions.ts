import {ADD_IC_DATA_ID, REMOVE_IC_DATA_ID, TOGGLE_ITEMNAV_ID} from "./actionTypes";
import {ICItemNavData} from "./state";


export type ToggleItemNavAction = {
    type: typeof TOGGLE_ITEMNAV_ID;
}
export type AddICDataAction = {
    type: typeof ADD_IC_DATA_ID;
    data: ICItemNavData;
}
export type RemoveICDataAction = {
    type: typeof REMOVE_IC_DATA_ID;
    id: number;
}


export const ToggleItemNav = () => ({ type: TOGGLE_ITEMNAV_ID }) as ToggleItemNavAction;

export const AddICData = (data: ICItemNavData) => ({ type: ADD_IC_DATA_ID, data }) as AddICDataAction;
export const RemoveICData = (id: number) => ({ type: REMOVE_IC_DATA_ID, id }) as RemoveICDataAction;


export type ItemNavActions =
    ToggleItemNavAction |
    AddICDataAction     |
    RemoveICDataAction;
