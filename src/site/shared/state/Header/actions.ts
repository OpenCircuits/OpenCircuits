import {CLOSE_HEADER_MENU_ID, OPEN_HEADER_MENU_ID,
        CLOSE_HEADER_POPUP_ID, OPEN_HEADER_POPUP_ID} from "./actionTypes";
import {HeaderMenus, HeaderPopups} from "./state";


export type OpenHeaderMenuAction = {
    type: typeof OPEN_HEADER_MENU_ID;
    menu: HeaderMenus;
}
export type CloseHeaderMenusAction = {
    type: typeof CLOSE_HEADER_MENU_ID;
}

export type OpenHeaderPopupAction = {
    type: typeof OPEN_HEADER_POPUP_ID;
    popup: HeaderPopups;
}
export type CloseHeaderPopupsAction = {
    type: typeof CLOSE_HEADER_POPUP_ID;
}


export const OpenHeaderMenu = (menu: HeaderMenus) => ({
    type: OPEN_HEADER_MENU_ID,
    menu
}) as OpenHeaderMenuAction;
export const CloseHeaderMenus = () => ({
    type: CLOSE_HEADER_MENU_ID
}) as CloseHeaderMenusAction;

export const OpenHeaderPopup = (popup: HeaderPopups) => ({
    type: OPEN_HEADER_POPUP_ID,
    popup
}) as OpenHeaderPopupAction;
export const CloseHeaderPopups = () => ({
    type: CLOSE_HEADER_POPUP_ID
}) as CloseHeaderPopupsAction;


export type HeaderActions =
    OpenHeaderMenuAction   |
    CloseHeaderMenusAction |
    OpenHeaderPopupAction  |
    CloseHeaderPopupsAction;
