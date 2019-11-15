import $ from "jquery";

import {MainDesignerController} from "./MainDesignerController";
import {SideNavCircuitPreview} from "../views/SideNavCircuitPreview";
import {RemoteController} from "./RemoteController";
import {CircuitMetadata,
        CircuitMetadataBuilder} from "core/models/CircuitMetadata";

export class SideNavController {
    private tab: JQuery<HTMLElement> = $("#header-sidenav-open-tab");
    private sidenav: JQuery<HTMLElement> = $("#sidenav");
    private overlay: JQuery<HTMLElement> = $("#overlay");
    private context: JQuery<HTMLElement> = $("#content");
    private sidenavModeCheckbox: JQuery<HTMLElement>= $("#sidenav-mode-checkbox");
    private exampleCircuitsList: JQuery<HTMLElement> = $("#example-circuit-list");

    private open: boolean;
    private disabled: boolean;

    private editMode: boolean;

    private userCircuits: SideNavCircuitPreview[];

    private main: MainDesignerController;

    public constructor(main: MainDesignerController) {
        this.main = main;

        this.open = false;
        this.disabled = false;

        this.editMode = true;

        this.userCircuits = [];

        this.tab.click(() => this.toggle());

        this.sidenavModeCheckbox.change(() => this.toggleEditMode());

        this.overlay.click(() => {
            if (this.isOpen())
                this.toggle();
        });

        // Set up onclick listeners to example circuits
        const exampleCircuits = Array.from(this.exampleCircuitsList.children()) as HTMLElement[];
        for (const exampleCircuit of exampleCircuits) {
            const id = exampleCircuit.id.split("-").slice(2).join("-");
            const name = exampleCircuit.children[1].children[0].innerHTML;
            const desc = exampleCircuit.children[1].children[1].innerHTML;
            const data = new CircuitMetadataBuilder()
                    .withId(id)
                    .withName(name)
                    .withDesc(desc)
                    .withVersion("1.1")
                    .build();
            exampleCircuit.onclick = () => RemoteController.LoadExampleCircuit(data, (c) => this.loadCircuit(c));
        }
    }

    private toggleEditMode(): void {
        this.editMode = !this.editMode;

        this.main.setEditMode(this.editMode);
    }

    private deleteUserCircuit(metadata: CircuitMetadata): void {
        if (confirm("Are you sure you want to delete circuit \"" + metadata.getName() + "\"?")) {
            RemoteController.DeleteUserCircuit(metadata, (succ) => {
                if (!succ) {
                    alert("Failed to delete circuit!");
                    return;
                }
                this.updateUserCircuits();
            });
        }
    }

    private loadCircuit(contents: XMLDocument): void {
        this.main.loadCircuit(contents);
        if (this.isOpen)
            this.toggle();
    }

    public clearUserCircuits(): void {
        this.userCircuits.forEach((c) => c.remove());
        this.userCircuits = [];
    }

    public updateUserCircuits(): void {
        this.clearUserCircuits();

        RemoteController.ListCircuits(async (data: CircuitMetadata[]) => {
            data.forEach((d) => {
                const preview = new SideNavCircuitPreview(d);
                preview.onClick(
                    () => RemoteController.LoadUserCircuit(d, (c) => this.loadCircuit(c)), 
                    () => this.deleteUserCircuit(d));
                this.userCircuits.push(preview);
            });
        });
    }

    public toggle(): void {
        if (this.disabled)
            return;

        this.open = !this.open;
        this.sidenav.toggleClass("sidenav__move");
        this.overlay.toggleClass("invisible");
        this.context.toggleClass("sidenav__shift");
    }

    public isOpen(): boolean {
        return this.open;
    }

    public enable(): void {
        this.disabled = false;
    }

    public disable(): void {
        this.disabled = true;
    }

}
