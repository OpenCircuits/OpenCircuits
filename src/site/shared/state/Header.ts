import {CreateState} from "shared/utils/CreateState";


export type HeaderMenus = "none" | "download" | "settings" | "tutorial" | "utilities";
export type HeaderPopups = "none" | "login" | "quick_start" | "keyboard_shortcuts" | "image_exporter" |
                           "expr_to_circuit" | "cache_circuit" | "reload_circuit";

const [initialState, actions, reducer] = CreateState()(
    {
        curMenu:  "none" as HeaderMenus,
        curPopup: "none" as HeaderPopups,
    },
    {
        OpenHeaderMenu:    (menu: HeaderMenus)   => ({ type: "OPEN_HEADER_MENU_ID",   menu  }) as const,
        CloseHeaderMenus:  ()                    => ({ type: "CLOSE_HEADER_MENUS_ID"        }) as const,
        OpenHeaderPopup:   (popup: HeaderPopups) => ({ type: "OPEN_HEADER_POPUP_ID",  popup }) as const,
        CloseHeaderPopups: ()                    => ({ type: "CLOSE_HEADER_POPUPS_ID"       }) as const,
    },
    {
        "OPEN_HEADER_MENU_ID":    (state, action) => ({ ...state, curMenu: action.menu }),
        "CLOSE_HEADER_MENUS_ID":  (state)         => ({ ...state, curMenu: "none" }) as const,
        "OPEN_HEADER_POPUP_ID":   (state, action) => ({ ...state, curPopup: action.popup }),
        "CLOSE_HEADER_POPUPS_ID": (state)         => ({ ...state, curPopup: "none" }) as const,
    }
);

export type HeaderState = typeof initialState;
export const { OpenHeaderMenu, CloseHeaderMenus, OpenHeaderPopup, CloseHeaderPopups } = actions;
export const headerReducer = reducer;
