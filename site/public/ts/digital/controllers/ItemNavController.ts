import $ from "jquery";

import {Vector,V} from "Vector";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

import {Component} from "core/models/Component";

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

        // const headerHeight = document.getElementById("header").offsetHeight + 10;

        // Set onclicks for each item
        const children = Array.from(this.itemnav.children());
        for (const child of children) {
            if (!(child instanceof HTMLButtonElement))
                continue;

            const xmlId = child.dataset.xmlid;
            const not = child.dataset.not == "true";

            const onClick = (): void => {
                main.placeComponent(CreateFromXML(xmlId, not), false);

                // Unfocus element
                if (child instanceof HTMLElement)
                    child.blur();
            }

            const onDragEnd = (p: Vector): void => {
                if (!(child instanceof HTMLButtonElement))
                    return;

                const component = CreateFromXML(xmlId, not);
                const pos = main.getCamera().getWorldPos(p);

                component.setPos(pos);
                main.placeComponent(component, true);

                main.render();
            }

            child.onclick = () => onClick();
            child.ondragend = (event) => onDragEnd(V(event.pageX, event.pageY));


            child.addEventListener("touchstart", (event) => {
                event.preventDefault();
            })
            child.addEventListener("touchend", (event) => {
                if (event.changedTouches.length != 1)
                    return;

                onDragEnd(V(event.changedTouches[0].pageX,
                            event.changedTouches[0].pageY));

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
