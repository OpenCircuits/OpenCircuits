import {ITEMNAV_WIDTH} from "../utils/Constants";

import {V} from "../utils/math/Vector";

import {MainDesignerController} from "./MainDesignerController";

import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {Component} from "../models/ioobjects/Component";

import {Input} from "../utils/Input";

export const ItemNavController = (function() {
    const tab = document.getElementById("itemnav-open-tab");
    const itemnav = document.getElementById("itemnav");

    let isOpen = false;
    let disabled = false;

    const toggle = function() {
        itemnav.classList.toggle("shrink");
        tab.classList.toggle("tab__closed");
    }

    const place = function(component: Component, instant: boolean): void {
        MainDesignerController.PlaceComponent(component, instant);
    }

    return {
        Init: function(): void {
            tab.onclick = () => { ItemNavController.Toggle(); }

            const headerHeight = document.getElementById("header").offsetHeight + 10;

            // Set onclicks for each item
            const children = Array.from(itemnav.children);
            for (const child of children) {
                if (!(child instanceof HTMLButtonElement))
                    continue;

                const xmlId = child.dataset.xmlid;
                const not = child.dataset.not == 'true';

                let dragStart = V(0,0);

                child.onclick = () => {
                    place(CreateComponentFromXML(xmlId, not), false);

                    // Unfocus element
                    if (child instanceof HTMLElement)
                        child.blur();
                }
                child.ondragstart = (event) => {
                    dragStart = V(event.offsetX, event.offsetY);
                }
                child.ondragend = (event) => {
                    if (!(child instanceof HTMLButtonElement))
                        return;

                    const component = CreateComponentFromXML(xmlId, not);

                    // Calculate world mouse pos from event
                    const canvas = MainDesignerController.GetCanvas();
                    const rect = canvas.getBoundingClientRect();
                    const mousePos = V(event.pageX - dragStart.x - rect.left,
                                       event.pageY - dragStart.y + headerHeight - rect.top);

                    const pos = MainDesignerController.GetCamera().getWorldPos(mousePos);

                    component.setPos(pos);
                    place(component, true);

                    MainDesignerController.Render();
                }
            }
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
            if (tab.classList.contains("invisible"))
                tab.classList.remove("invisible");
        },
        Disable: function(): void {
            disabled = true;
            if (!tab.classList.contains("invisible"))
                tab.classList.add("invisible");
        }
    }

})();
