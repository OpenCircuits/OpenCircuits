import $ from "jquery";

import {SAVE_VERSION} from "core/utils/Constants";
import {OVERWRITE_CIRCUIT_MESSAGE} from "../utils/Constants";
import {SAVED} from "core/utils/Config";

import {CircuitMetadata,
        CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {SideNavCircuitPreview} from "site/shared/views/SideNavCircuitPreview";
import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {RemoteController} from "site/shared/controllers/RemoteController";
import {HeaderController} from "./HeaderController";

export class SideNavController {
    private tab: JQuery<HTMLElement> = $("#header-sidenav-open-tab");
    private sidenav: JQuery<HTMLElement> = $("#sidenav");
    private overlay: JQuery<HTMLElement> = $("#overlay");
    private context: JQuery<HTMLElement> = $("#content");
    private exampleCircuitsList: JQuery<HTMLElement> = $("#example-circuit-list");

    private open: boolean;
    private disabled: boolean;

    private userCircuits: SideNavCircuitPreview[];

    private main: MainDesignerController;
    private header: HeaderController;

    public constructor(main: MainDesignerController, header: HeaderController) {
        this.main = main;
        this.header = header;

        this.open = false;
        this.disabled = false;

        this.userCircuits = [];

        this.tab.click(() => this.toggle());

        this.overlay.click(() => {
            this.close();
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
                    .withVersion(SAVE_VERSION)
                    .build();
            exampleCircuit.onclick = () => RemoteController.LoadExampleCircuit(data, (c) => this.loadCircuit(c));
        }
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

    private loadCircuit(contents: string): void {
        const open = SAVED || confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;

        const data = this.main.loadCircuit(contents);
        this.header.setProjectName(data.getName());
        this.close();
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

    public close(): void {
        if (this.isOpen())
            this.toggle();
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
