import $ from "jquery";

import {Create} from "serialeazy";

import {V, Vector} from "Vector";
import {RectContains} from "math/MathUtils";

import {Component} from "core/models/Component";
import {PlaceAction} from "core/actions/addition/PlaceAction";

import {DOMRectToTransform} from "site/shared/utils/DOMUtils";
import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {Browser} from "core/utils/Browser";
import {ItemNav} from "../models/ItemNav";
import {ItemNavItem} from "../models/ItemNavItem";

export class ItemNavController {
    private tab: JQuery<HTMLElement>;
    private itemnav: JQuery<HTMLElement>;

    private open: boolean;
    private disabled: boolean;

    private nav: ItemNav;

    public constructor(main: MainDesignerController) {
        this.tab = $("#itemnav-open-tab");
        this.itemnav = $("#itemnav");

        this.nav = new ItemNav("itemnav");

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
            if (uuid !== "")
                this.placeComponent(main, uuid, V(ev.pageX, ev.pageY));
        }

        for (const item of this.nav.getSections().flatMap(s => s.getItems()))
            this.hookupListeners(main, item);
    }

    private hookupListeners(main: MainDesignerController, item: ItemNavItem): void {
        const uuid = item.getUUID();
        const child = item.getElement();

        // On click cause instant place (desktop only)
        if (!Browser.mobile) {
            child.onclick = () => {
                main.setPlaceToolComponent(Create<Component>(uuid));
            }
        }

        // Add uuid data to drag event
        child.ondragstart = (event) => {
            // Cancel potential click-to-place event when we start dragging
            main.setPlaceToolComponent(undefined);

            event.dataTransfer.setData("custom/component", uuid);
            event.dataTransfer.dropEffect = "copy";

            // Blur the element so that pressing SPACE after dragging
            //  doesn't cause the element to get clicked
            child.blur();
        };

        /**
         * CUSTOM DRAG + DROP FOR TOUCH (MOBILE)
         */
        let touchDragging = false;
        child.ontouchstart = (event) => {
            if (event.touches.length == 1) {
                main.setPlaceToolComponent(undefined);
                touchDragging = true;
            }
        }
        child.ontouchend = (ev) => {
            if (!touchDragging)
                return;
            touchDragging = false;

            // Determine if the touch is over the canvas and not over the ItemNav or header
            const touch = ev.changedTouches[0];
            const pos = V(touch.pageX, touch.pageY);
            const rect1 = DOMRectToTransform(this.itemnav[0].getBoundingClientRect());
            const rect2 = DOMRectToTransform($("#header")[0].getBoundingClientRect());
            if (RectContains(rect1, pos) || RectContains(rect2, pos))
                return;

            this.placeComponent(main, uuid, pos);
        }
    }

    private toggleElements(): void {
        this.itemnav.toggleClass("itemnav__move");
        this.tab.toggleClass("tab__closed");
    }

    private placeComponent(main: MainDesignerController, uuid: string, pos: Vector): void {
        const component = Create<Component>(uuid);

        // Set position at drop location
        component.setPos(main.getCamera().getWorldPos(pos));

        // Instantly add component
        main.addAction(new PlaceAction(main.getDesigner(), component).execute());

        main.render();
    }

    public setActive(active: boolean): void {
        if (!active) {
            // Hide and disable ItemNavController
            if (this.isOpen())
                this.toggle();
            this.disable();
        } else {
            this.enable();
        }
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
