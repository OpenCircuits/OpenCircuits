import {OPEN_CONTEXT_MENU_ID, CLOSE_CONTEXT_MENU_ID} from "./actionTypes";

export type OpenContextMenuAction  = { type: typeof OPEN_CONTEXT_MENU_ID; }
export type CloseContextMenuAction = { type: typeof CLOSE_CONTEXT_MENU_ID; }

export const OpenContextMenu  = () => ({ type: OPEN_CONTEXT_MENU_ID }) as OpenContextMenuAction;
export const CloseContextMenu = () => ({ type: CLOSE_CONTEXT_MENU_ID }) as CloseContextMenuAction;

export type ContextMenuActions =
    OpenContextMenuAction |
    CloseContextMenuAction;
