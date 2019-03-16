import {MainDesignerController} from "./MainDesignerController";

export const SideNavController = (function() {
    const tab = document.getElementById("header-sidenav-open-tab");
    const sidenav = document.getElementById("sidenav");

    const sidenavModeCheckbox = <HTMLInputElement>document.getElementById("sidenav-mode-checkbox");

    const overlay = document.getElementById("overlay");

    let isOpen = false;
    let disabled = false;

    let editMode = true;

    let toggleEditMode = function() {
        editMode = !editMode;
        MainDesignerController.SetEditMode(editMode);
    }

    let toggle = function() {
        sidenav.classList.toggle("shrink");
        overlay.classList.toggle("invisible");
    }

    return {
        Init: function(): void {
            isOpen = false;

            tab.onclick = () => { SideNavController.Toggle(); };

            sidenavModeCheckbox.onchange = () => { toggleEditMode() };

            overlay.onclick = () => { SideNavController.Toggle(); };
        },
        Toggle: function(): void {
            if (disabled)
                return;

            isOpen = !isOpen;
            toggle();
        },
        IsOpen: function(): boolean {
            return isOpen;
        },
        Enable: function(): void {
            disabled = false;
        },
        Disable: function(): void {
            disabled = true;
        }
    }

})();
