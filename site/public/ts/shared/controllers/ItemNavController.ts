import $ from "jquery";

import {V} from "Vector";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

import {Component} from "core/models/Component";
import {PlaceAction} from "core/actions/addition/PlaceAction";

export class ItemNavController {
    private tab: JQuery<HTMLElement>;
    private itemnav: JQuery<HTMLElement>;

    private open: boolean;
    private disabled: boolean;

    public constructor(main: MainDesignerController, CreateFromXML: (tag: string, not?: boolean) => Component) {
        this.tab = $("#itemnav-open-tab");
        this.itemnav = $("#itemnav");

        this.open = false;
        this.disabled = false;

        this.tab.click(() => this.toggle());


        // Publicize the canvas as a drop target for components dragged in from the side menu
        const canvas = main.getCanvas();
        canvas.ondragover = (ev: DragEvent) => {
            const isComponent = ev.dataTransfer.types.includes("custom/component");
            if (isComponent) {
                ev.preventDefault();
            }
        };

        // And instruct it to add new components when they are dragged over
        canvas.ondrop = (ev: DragEvent) => {
            const data = ev.dataTransfer.getData("custom/component");
            if (data !== "") {
                const parse = data.split(";");
                const not = parse[0] == "true";
                const xmlId = parse[1];

                const component = CreateFromXML(xmlId, not) as Component;
                const pos = main.getCamera().getWorldPos(V(ev.pageX, ev.pageY));

                component.setPos(pos);

                // Instantly add component
                main.addAction(new PlaceAction(main.getDesigner(), component).execute());

                main.render();
            }
        }

        // const headerHeight = document.getElementById("header").offsetHeight + 10;

        // Set onclicks for each item
        const children = Array.from(this.itemnav.children());
        for (const child of children) {
            if (!(child instanceof HTMLButtonElement))
                continue;

            const xmlId = child.dataset.xmlid;
            const not = child.dataset.not == "true";

            const onClick = (): void => {
                const component = CreateFromXML(xmlId, not) as Component;
                main.placeComponent(component);
            }

            child.onclick = () => onClick();
            // Pin all the data we need to make a new component onto the drag event
            // ! WARNING: this encoding will break if any components have a semicolon in their xmlId
            child.ondragstart = (event) => {
                event.dataTransfer.setData("custom/component", `${not};${xmlId}`);
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
