import $ from "jquery";

import {Create} from "serialeazy";

import {V} from "Vector";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

import {Component} from "core/models/Component";
import {PlaceAction} from "core/actions/addition/PlaceAction";

export class ItemNavController {
    private tab: JQuery<HTMLElement>;
    private itemnav: JQuery<HTMLElement>;

    private open: boolean;
    private disabled: boolean;

    public constructor(main: MainDesignerController) {
        this.tab = $("#itemnav-open-tab");
        this.itemnav = $("#itemnav");

        this.open = false;
        this.disabled = false;

        this.tab.click(() => this.toggle());


        // Publicize the canvas as a drop target for components dragged in from the side menu
        const canvas = main.getCanvas();
        canvas.ondragover = (ev: DragEvent) => {
            const isComponent = ev.dataTransfer.types.includes("custom/component");
            if (isComponent)
                ev.preventDefault();
        };

        // And instruct it to add new components when they are dragged over
        canvas.ondrop = (ev: DragEvent) => {
            const uuid = ev.dataTransfer.getData("custom/component");
            if (uuid !== "") {
                const component = Create<Component>(uuid);

                // Set position at drop location
                component.setPos(main.getCamera().getWorldPos(V(ev.pageX, ev.pageY)));

                // Instantly add component
                main.addAction(new PlaceAction(main.getDesigner(), component).execute());

                main.render();
            }
        }

        // Set on-clicks for each item
        const children = Array.from(this.itemnav.children());
        for (const child of children) {
            if (!(child instanceof HTMLButtonElement))
                continue;

            const uuid = child.dataset.uuid;

            // On click cause instant place
            child.onclick = () => {
                main.setPlaceToolComponent(Create<Component>(uuid));
            }

            // Add uuid data to drag event
            child.ondragstart = (event) => {
                // Cancel potential click-to-place event when we start dragging
                main.setPlaceToolComponent(undefined);

                event.dataTransfer.setData("custom/component", uuid);
                event.dataTransfer.dropEffect = "copy";
            };

            child.addEventListener("touchstart", (event) => {
                event.preventDefault();
            })
            child.addEventListener("touchend", (event) => {
                event.preventDefault();
            }, false);
        }
    }

    private toggleElements(): void {
        this.itemnav.toggleClass("itemnav__move");
        this.tab.toggleClass("tab__closed");
    }

    public toggle(): void {
        if (this.disabled)
            return;

        this.open = !this.open;
        this.toggleElements();
    }

    public isOpen(): boolean {
        return this.open;
    }

    public enable(): void {
        this.disabled = false;
        this.tab.removeClass("invisible");
    }

    public disable(): void {
        this.disabled = true;
        this.tab.addClass("invisible");
    }
}
