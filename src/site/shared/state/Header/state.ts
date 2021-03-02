
export type HeaderMenus = "none" | "download" | "tutorial" | "tools";
export type HeaderPopups = "none" | "login" | "quick_start" | "keyboard_shortcuts";

export type HeaderState = {
    curMenu: HeaderMenus;
    curPopup: HeaderPopups;
}
