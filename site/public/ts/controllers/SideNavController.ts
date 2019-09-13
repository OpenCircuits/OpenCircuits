import {Importer} from "core/utils/io/Importer";

import {MainDesignerController} from "./MainDesignerController";
import {ItemNavController} from "./ItemNavController";
import {HeaderController} from "./HeaderController";
import {SideNavCircuitPreview} from "../views/SideNavCircuitPreview";
import {RemoteController} from "./RemoteController";
import {CircuitMetadata,
        CircuitMetadataBuilder} from "digital/models/CircuitMetadata";

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

    let userCircuits: SideNavCircuitPreview[] = [];

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
        isOpen = !isOpen;
        sidenav.classList.toggle("sidenav__move");
        overlay.classList.toggle("invisible");
        context.classList.toggle("sidenav__shift");
    }

    const loadCircuit = function(contents: XMLDocument): void {
        Importer.PromptLoadCircuit(MainDesignerController.GetDesigner(), contents, HeaderController.SetProjectName);
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
                const name = exampleCircuit.children[1].children[0].innerHTML;
                const desc = exampleCircuit.children[1].children[1].innerHTML;
                const data = new CircuitMetadataBuilder()
                        .withId(id)
                        .withName(name)
                        .withDesc(desc)
                        .withVersion("1.1")
                        .build();
                exampleCircuit.onclick = () => RemoteController.LoadExampleCircuit(data, loadCircuit);
            }
        },
        ClearUserCircuits(): void {
            userCircuits.forEach((c) => c.remove());
            userCircuits = [];
        },
        UpdateUserCircuits(): void {
            SideNavController.ClearUserCircuits();

            RemoteController.ListCircuits(async (data: CircuitMetadata[]) => {
                data.forEach((d) => {
                    const preview = new SideNavCircuitPreview(d);
                    preview.onClick(() => RemoteController.LoadUserCircuit(d, loadCircuit));
                    userCircuits.push(preview);
                });
            });
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
