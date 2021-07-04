import {TOGGLE_SIDENAV_ID} from "./actionTypes";


export type ToggleSideNavAction = {
    type: typeof TOGGLE_SIDENAV_ID;
}




export const ToggleSideNav = () => ({
    type: TOGGLE_SIDENAV_ID
}) as ToggleSideNavAction;




export type SideNavActions = 
    ToggleSideNavAction;
