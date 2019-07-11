import {Vector,V} from "../utils/math/Vector";

import {MainDesignerController} from "./MainDesignerController";

import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {Component} from "../models/ioobjects/Component";

export const ItemNavController = (() => {
    const tab = document.getElementById("itemnav-open-tab");
    const itemnav = document.getElementById("itemnav");

    let isOpen = false;
    let disabled = false;

    const toggle = function(): void {
        itemnav.classList.toggle("shrink");
        tab.classList.toggle("tab__closed");
    }

    const place = function(component: Component, instant: boolean): void {
        MainDesignerController.PlaceComponent(component, instant);
    }

    return {
        Init: function(): void {
            tab.onclick = () => { ItemNavController.Toggle(); }

            // const headerHeight = document.getElementById("header").offsetHeight + 10;

            // Set onclicks for each item
            const children = Array.from(itemnav.children);
            for (const child of children) {
                if (!(child instanceof HTMLButtonElement))
                    continue;

                const xmlId = child.dataset.xmlid;
                const not = child.dataset.not == 'true';

                const onClick = (): void => {
                    place(CreateComponentFromXML(xmlId, not), false);

                    // Unfocus element
                    if (child instanceof HTMLElement)
                        child.blur();
                }

                const onDragEnd = (p: Vector): void => {
                    if (!(child instanceof HTMLButtonElement))
                        return;

                    const component = CreateComponentFromXML(xmlId, not);
                    const pos = MainDesignerController.GetCamera().getWorldPos(p);

                    component.setPos(pos);
                    place(component, true);

                    MainDesignerController.Render();
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
