import {ITEMNAV_WIDTH} from "../utils/Constants";

import {CreateComponentFromXML} from "../utils/ComponentFactory";

import {Component} from "../models/ioobjects/Component";

import {MainDesignerController} from "./MainDesignerController";

export const ItemNavController = (function() {
    const tab = document.getElementById("itemnav-open-tab");
    const itemnav = document.getElementById("itemnav");

    let isOpen = false;
    let disabled = false;

    const toggle = function() {
        itemnav.classList.toggle("shrink");
        tab.classList.toggle("tab__closed");
    }

    const place = function(component: Component) {
        MainDesignerController.PlaceComponent(component);
    }

    return {
        Init: function(): void {
            tab.onclick = () => { ItemNavController.Toggle(); }

            // Set onclicks for each item
            for (let i = 0; i < itemnav.children.length; i++) {
                let child = itemnav.children[i];
                if (!(child instanceof HTMLButtonElement))
                    continue;

                const xmlId = child.dataset.xmlid;
                const not = child.dataset.not == 'true';

                child.onclick = () => { place(CreateComponentFromXML(xmlId, not)); }
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
