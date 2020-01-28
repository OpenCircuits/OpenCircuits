import $ from "jquery";

import {ICData} from "digital/models/ioobjects/other/ICData";

import {ItemNavItem} from "site/shared/models/ItemNavItem";
import {ItemNavSection} from "site/shared/models/ItemNavSection";
import {ItemNavController} from "site/shared/controllers/ItemNavController";
import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {Component} from "core/models/Component";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {IC} from "digital/models/ioobjects/other/IC";

export class DigitalItemNavController extends ItemNavController {
    private icSection: ItemNavSection;

    public constructor(main: MainDesignerController) {
        super(main);

        this.icSection = new ItemNavSection($(`
            <h4 id="itemnav-section-ics" unselectable="">ICs</h4>
        `).appendTo($("#itemnav")) as JQuery<HTMLHeadingElement>);

        // Initial hidden
        this.icSection.getHeader().hide();
    }

    protected createComponent(uuid: string): Component {
        if (!uuid.startsWith("IC"))
            return super.createComponent(uuid);

        const icIndex = Number.parseInt(uuid.split("-")[1]);
        const designer = this.main.getDesigner() as DigitalCircuitDesigner;
        return new IC(designer.getICData()[icIndex]);
    }

    public updateICSection(ics: ICData[]): void {
        this.icSection.removeItems();

        if (ics.length == 0) {
            $(this.icSection.getHeader()).hide();
            return;
        }

        this.icSection.getHeader().show();

        ics.forEach((ic, i) => {
            const newItem = new ItemNavItem($(`
                <button id="itemnav-section-ics-button-${ic.getName()}" type="button" data-uuid="IC-${i}">
                    <img id="itemnav-section-other-img-${ic.getName()}" src="img/icons/other/demultiplexer.svg" alt="IC">
                    <br>${ic.getName() || "IC"}
                </button>
            `).insertAfter(this.icSection.getHeader()) as JQuery<HTMLButtonElement>);

            this.hookupListeners(newItem);

            this.icSection.addItem(newItem);
        });
    }

}
