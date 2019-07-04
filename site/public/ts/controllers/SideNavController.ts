import {MainDesignerController} from "./MainDesignerController";
import {ItemNavController} from "./ItemNavController";
import {promises} from "fs";
import {Exporter} from "../utils/io/Exporter";

export const SideNavController = (() => {
    const tab = document.getElementById("header-sidenav-open-tab");
    const sidenav = document.getElementById("sidenav");

    const sidenavModeCheckbox = <HTMLInputElement>document.getElementById("sidenav-mode-checkbox");

    const overlay = document.getElementById("overlay");

    let isOpen = false;
    let disabled = false;

    let editMode = true;

    const toggleEditMode = function(): void {
        editMode = !editMode;

        MainDesignerController.SetEditMode(!editMode);

        // Toggle ItemNavController
        if (ItemNavController.IsOpen())
            ItemNavController.Toggle();

        // Disable or re-enable ItemNavController
        if (editMode)
            ItemNavController.Enable();
        else
            ItemNavController.Disable();

        // Toggle SideNavController if entering play mode
        if (SideNavController.IsOpen() && !editMode)
            SideNavController.Toggle();
    }

    const toggle = function(): void {
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
