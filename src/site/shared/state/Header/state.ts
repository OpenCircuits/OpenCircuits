
export type HeaderMenus = "none" | "download" | "tutorial";
export type HeaderPopups = "none" | "quick_start" | "keyboard_shortcuts";

export type HeaderState = {
    curMenu: HeaderMenus;
    curPopup: HeaderPopups;
}
