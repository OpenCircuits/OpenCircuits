import {LoadExampleCircuit} from "../utils/api/Example";
import {Importer} from "../utils/io/Importer";

import {MainDesignerController} from "./MainDesignerController";
import {ItemNavController} from "./ItemNavController";
import {HeaderController} from "./HeaderController";

export const SideNavController = (() => {
    const tab = document.getElementById("header-sidenav-open-tab");
    const sidenav = document.getElementById("sidenav");

    const sidenavModeCheckbox = <HTMLInputElement>document.getElementById("sidenav-mode-checkbox");

    const overlay = document.getElementById("overlay");

    const context = document.getElementById("content");

    const exampleCircuitsList = document.getElementById("example-circuit-list");

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

    }

    const toggle = function(): void {
        isOpen = !isOpen;
        sidenav.classList.toggle("sidenav__move");
        overlay.classList.toggle("invisible");
        context.classList.toggle("sidenav__shift");
    }

    // Callback
    const loadExampleCircuit = async function(id: string): Promise<void> {
        const contents = await LoadExampleCircuit(id);
        Importer.LoadCircuitFromString(MainDesignerController.GetDesigner(), contents, HeaderController.SetProjectName);
        if (isOpen)
            toggle();
    }

    return {
        Init: function(): void {
            isOpen = false;

            tab.onclick = () => { SideNavController.Toggle(); };

            sidenavModeCheckbox.onchange = () => { toggleEditMode() };

            overlay.addEventListener("click", () => {
                if (SideNavController.IsOpen())
                    SideNavController.Toggle();
            });

            // Set up onclick listeners to example circuits
            const exampleCircuits = Array.from(exampleCircuitsList.children) as HTMLElement[];
            for (const exampleCircuit of exampleCircuits) {
                const id = exampleCircuit.id.split("-")[2];
                exampleCircuit.onclick = () => loadExampleCircuit(id);
            }
        },
        Toggle: function(): void {
            if (disabled)
                return;

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
